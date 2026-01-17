"use server";

import { isPast } from "date-fns";
import { returnValidationErrors } from "next-safe-action";
import Stripe from "stripe";
import z from "zod";

import { authActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  serviceId: z.uuid(),
  date: z.date(),
});

export const createBookingCheckoutSession = authActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date }, ctx: { userId } }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Chave de API do Stripe não encontrada."],
      });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        barbershop: true,
      },
    });
    if (!service) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Serviço não encontrado."],
      });
    }
    if (isPast(date)) {
      return returnValidationErrors(inputSchema, {
        date: ["Data e hora selecionadas já passaram."],
      });
    }
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barbershopId: service.barbershopId,
        date,
        cancelledAt: null,
      },
    });
    if (existingBooking) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Data e hora selecionadas já estão agendadas."],
      });
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        serviceId: service.id,
        barbershopId: service.barbershopId,
        userId: userId,
        date: date.toISOString(),
      },
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: service.priceInCents,
            product_data: {
              name: `${service.barbershop.name} - ${service.name}`,
              description: service.description,
              images: [service.imageUrl],
            },
          },
          quantity: 1,
        },
      ],
    });
    return {
      id: checkoutSession.id,
      url: checkoutSession.url,
    };
  });
