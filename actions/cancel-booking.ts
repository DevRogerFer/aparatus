"use server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { authActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  bookingId: z.uuid(),
});

export const cancelBooking = authActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { bookingId }, ctx: { userId } }) => {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!booking) {
      returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado."],
      });
    }
    if (booking.userId !== userId) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para cancelar este agendamento."],
      });
    }
    if (booking.cancelledAt) {
      returnValidationErrors(inputSchema, {
        _errors: ["Este agendamento já foi cancelado."],
      });
    }
    if (new Date(booking.date) < new Date()) {
      returnValidationErrors(inputSchema, {
        _errors: ["Não é possível cancelar um agendamento que já passou."],
      });
    }
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        cancelledAt: new Date(),
      },
    });
    return updatedBooking;
  });
