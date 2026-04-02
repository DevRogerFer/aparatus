import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { headers } from "next/headers";
import z from "zod";

import { createBookingCheckoutSession } from "@/actions/create-booking-checkout-session";
import { getDateAvailableTimeSlots } from "@/actions/get-date-available-time-slots";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id ?? null;
  const { messages } = await request.json();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    system: `Você é o Agenda.ai, um assistente virtual de agendamento de barbearias.

    DATA ATUAL: Hoje é ${new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} (${new Date().toISOString().split("T")[0]})
chat/r
    Seu objetivo é ajudar os usuários a:
    - Encontrar barbearias (por nome ou todas disponíveis)
    - Verificar disponibilidade de horários para barbearias específicas
    - Fornecer informações sobre serviços e preços

    Fluxo de atendimento:

    CENÁRIO 1 - Usuário menciona data/horário na primeira mensagem (ex: "quero um corte pra hoje", "preciso cortar o cabelo amanhã", "quero marcar para sexta"):
    1. Use a ferramenta searchBarbershops para buscar barbearias
    2. IMEDIATAMENTE após receber as barbearias, use a ferramenta getAvailableTimeSlotsForBarbershop para CADA barbearia retornada, passando a data mencionada pelo usuário
    3. Apresente APENAS as barbearias que têm horários disponíveis, mostrando:
       - Nome da barbearia
       - Endereço
       - Serviços oferecidos com preços
       - Os horários disponíveis, considerando a data mencionada pelo usuário
    4. Quando o usuário escolher, forneça o resumo final

    CENÁRIO 2 - Usuário não menciona data/horário inicialmente:
    1. Use a ferramenta searchBarbershops para buscar barbearias
    2. Apresente as barbearias encontradas com:
       - Nome da barbearia
       - Endereço
       - Serviços oferecidos com preços
    3. Quando o usuário demonstrar interesse em uma barbearia específica ou mencionar uma data, pergunte a data desejada (se ainda não foi informada)
    4. Use a ferramenta getAvailableTimeSlotsForBarbershop passando o barbershopId e a data
    5. Apresente os horários disponíveis, considerando a data mencionada pelo usuário
    6. Caso seja a data atual, filtre os horários que já passaram
    7. Caso seja data futura, apresente todos os horários disponíveis
    8. Quando o usuário escolher, forneça o resumo final

    Resumo final (quando o usuário escolher):
    - Nome da barbearia
    - Endereço
    - Serviço escolhido
    - Data e horário escolhido
    - Preço

    Criação da reserva:
    - Após o usuário confirmar explicitamente a escolha (ex: "confirmo", "pode agendar", "quero esse horário"), use OBRIGATORIAMENTE a tool createBookingCheckoutSession
    - É a ÚNICA forma de criar um agendamento — não existe outra tool para isso
    - Envie SEMPRE data e hora completas (YYYY-MM-DDTHH:mm)
    - O usuário precisa estar logado para prosseguir
    - Se a tool retornar error NOT_AUTHENTICATED, informe ao usuário que ele precisa fazer login
    - Se a tool retornar success: true, informe que a reserva foi registrada e que um botão de pagamento aparecerá automaticamente no chat
    - Se houver erro (success: false), explique o problema e peça para tentar novamente
    
    IMPORTANTE — PAGAMENTO:
    - O botão de pagamento é renderizado AUTOMATICAMENTE pelo frontend quando a tool retorna com sucesso
    - Você NÃO precisa gerar links, URLs ou botões de pagamento no texto
    - Apenas informe: "A reserva foi confirmada com sucesso! Um botão de pagamento aparecerá abaixo. Clique nele para finalizar o pagamento."
    - NUNCA escreva URLs do Stripe ou links em Markdown
    
    Importante:
    - Para criar um agendamento, o usuário precisa estar logado
    - Se o usuário não estiver logado, peça para ele fazer login antes de continuar
    - NUNCA mostre informações técnicas ao usuário (barbershopId, serviceId, formatos ISO de data, etc.)
    - Seja sempre educado, prestativo e use uma linguagem informal e amigável
    - Não liste TODOS os horários disponíveis, sugira apenas 4-5 opções espaçadas ao longo do dia
    - Se não houver horários disponíveis, sugira uma data alternativa
    - Quando o usuário mencionar "hoje", "amanhã", "depois de amanhã" ou dias da semana, calcule a data correta automaticamente 
    `,
    tools: {
      searchBarbershops: tool({
        description:
          "Pesquisa barbearias pelo nome. Se nenhum nome é passado, retorna todas as barbearias.",
        inputSchema: z.object({
          name: z
            .string()
            .optional()
            .describe(
              "O nome da barbearia a ser pesquisada. Se nenhum nome é passado, retorna todas as barbearias.",
            ),
        }),
        execute: async ({ name }) => {
          if (!name?.trim()) {
            const barbershops = await prisma.barbershop.findMany({
              select: {
                id: true,
                name: true,
                address: true,
                phones: true,
                description: true,
                services: true,
              },
            });
            return barbershops;
          }
          const barbershops = await prisma.barbershop.findMany({
            where: {
              name: {
                contains: name,
                mode: "insensitive",
              },
            },
            select: {
              id: true,
              name: true,
              address: true,
              phones: true,
              description: true,
              services: true,
            },
          });
          return barbershops;
        },
      }),
      getAvailableTimeSlotsForBarbershop: tool({
        description:
          "Obtém os horários disponíveis para uma barbearia específica.",
        inputSchema: z.object({
          barbershopId: z.string().uuid(),
          date: z
            .string()
            .describe(
              "A data no formato ISO (YYYY-MM-DDTHH:mm) para a qual você deseja verificar os horários disponíveis.",
            ),
        }),
        execute: async ({ barbershopId, date }) => {
          //console.log("getAvailableTimeSlotsForBarbershop", barbershopId, date);
          const availableTimeSlots = await getDateAvailableTimeSlots({
            barbershopId,
            date: new Date(date),
          });
          return {
            barbershopId,
            date,
            availableTimeSlots,
          };
        },
      }),
      createBookingCheckoutSession: tool({
        description:
          "Inicia o pagamento no Stripe para confirmar o agendamento.",
        inputSchema: z.object({
          serviceId: z.uuid(),
          date: z
            .string()
            .describe(
              "Data no formato ISO (YYYY-MM-DDTHH:mm) para criar o checkout do agendamento.",
            ),
        }),
        execute: async ({ serviceId, date }) => {
          // console.log("CHAT SESSION", session);
          // console.log("CHECKOUT DATE RECEIVED:", date);

          if (!userId) {
            return {
              success: false,
              error: "NOT_AUTHENTICATED",
            };
          }

          try {
            const parsedDate = new Date(date);

            const result = await createBookingCheckoutSession({
              serviceId,
              date: parsedDate,
            });

            if (!result?.data) {
              return {
                success: false,
                error: "CHECKOUT_FAILED",
              };
            }

            return {
              success: true,
              sessionId: result.data.id,
              checkoutUrl: result.data.url,
            };
          } catch (error) {
            console.error("Stripe checkout error", error);
            return {
              success: false,
              error: "CHECKOUT_EXCEPTION",
            };
          }
        },
      }),
    },
  });
  return result.toUIMessageStreamResponse();
};
