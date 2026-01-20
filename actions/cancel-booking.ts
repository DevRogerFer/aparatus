"use server";

import { returnValidationErrors } from "next-safe-action";
import Stripe from "stripe";
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
      return returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado."],
      });
    }
    if (booking.userId !== userId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para cancelar este agendamento."],
      });
    }
    if (booking.cancelledAt) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Este agendamento já foi cancelado."],
      });
    }
    if (new Date(booking.date) < new Date()) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Não é possível cancelar um agendamento que já passou."],
      });
    }
    if (booking.stripeChargeId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return returnValidationErrors(inputSchema, {
          _errors: ["Erro ao processar reembolso. Por favor, tente novamente."],
        });
      }
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.refunds.create({
          charge: booking.stripeChargeId,
          reason: "requested_by_customer",
        });
      } catch (error) {
        console.error("Erro ao processar reembolso:", error);
        return returnValidationErrors(inputSchema, {
          _errors: ["Erro ao processar reembolso. Por favor, tente novamente."],
        });
      }
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
