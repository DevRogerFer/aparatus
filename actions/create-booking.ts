"use server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { authActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

// This schema is used to validate input from client.
const inputSchema = z.object({
  serviceId: z.uuid(),
  date: z.date(),
});

export const createBooking = authActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date }, ctx: { userId } }) => {
    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
    });
    // Serviço existe?
    if (!service) {
      returnValidationErrors(inputSchema, {
        _errors: [
          "Serviço não encontrado. Por favor, selecione outro serviço.",
        ],
      });
    }
    // Já tem agendamento pra esse horário?
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barbershopId: service.barbershopId,
        date,
      },
    });
    if (existingBooking) {
      returnValidationErrors(inputSchema, {
        _errors: ["Data e hora selecionadas já estão agendadas."],
      });
    }
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        date: date.toISOString(),
        userId,
        barbershopId: service.barbershopId,
      },
    });
    return booking;
  });
