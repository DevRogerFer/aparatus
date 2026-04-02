import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { headers } from "next/headers";
import z from "zod";

import { createBooking } from "@/actions/create-booking";
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
    - Após o usuário confirmar explicitamente a escolha (ex: "confirmo", "pode agendar", "quero esse horário"), use a tool createBookingCheckoutSession
    - Essa tool inicia o pagamento no Stripe
    - Envie SEMPRE data e hora completas (YYYY-MM-DDTHH:mm)
    - O usuário precisa estar logado para prosseguir
    - Após o pagamento, o agendamento será confirmado automaticamente
    - Se a tool retornar error NOT_AUTHENTICATED:
      * Informe ao usuário que ele precisa estar logado para criar uma reserva
    - Ao confirmar a reserva, envie sempre a data e o horário completos no formato ISO (YYYY-MM-DDTHH:mm)
    - Exemplo: "2026-01-31T14:15"
    - Parâmetros necessários:
      * serviceId: ID do serviço escolhido
      * date: Data e horário no formato ISO completo (YYYY-MM-DDTHH:mm) - exemplo: "2026-01-31T14:15"
    - Se a criação for bem-sucedida (success: true), informe ao usuário que a reserva foi confirmada com sucesso
    - Se houver erro (success: false), explique o erro ao usuário:
      * Se o erro for "User must be logged in", informe que é necessário fazer login para criar uma reserva
      * Para outros erros, informe que houve um problema e peça para tentar novamente
    
    IMPORTANTE — PAGAMENTO:
    - Quando o pagamento for iniciado:
      * NÃO gere links Markdown para o Stripe.
      * Apenas informe que o pagamento será aberto automaticamente.
      * Exemplo de mensagem correta: "O pagamento será aberto automaticamente em uma nova aba. Se isso não acontecer, me avise para gerar um novo pagamento."
    - NUNCA gere links de pagamento em texto ou Markdown
    - NUNCA escreva URLs do Stripe para o usuário
    - Quando o pagamento for necessário, use EXCLUSIVAMENTE a tool createBookingCheckoutSession
    - O frontend será responsável por abrir o Stripe automaticamente
    
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
      createBooking: tool({
        description:
          "Cria um novo agendamento para um serviço específico em uma data específica.",
        inputSchema: z.object({
          serviceId: z.uuid(),
          date: z
            .string()
            .describe(
              "A data no formato ISO (YYYY-MM-DDTHH:mm) para a qual você deseja criar o agendamento.",
            ),
        }),
        execute: async ({ serviceId, date }) => {
          // console.log("createBooking", serviceId, date);
          try {
            await createBooking({
              serviceId,
              date: new Date(date),
            });
            return {
              success: true,
            };
          } catch (error) {
            console.error("createBooking error", error);
            return {
              success: false,
            };
          }
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
