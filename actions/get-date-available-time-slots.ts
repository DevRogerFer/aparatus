"use server";

import { endOfDay, isToday, startOfDay } from "date-fns";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  barbershopId: z.uuid(),
  date: z.date(),
});

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  let minutes = 9 * 60;
  const endMinutes = 18 * 60;

  while (minutes <= endMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(
      `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
    );
    minutes += 45;
  }

  return slots;
})();

export const getDateAvailableTimeSlots = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { barbershopId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Não autorizado. Por favor, faça login para continuar."],
      });
    }
    const bookings = await prisma.booking.findMany({
      where: {
        barbershopId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
        cancelledAt: null,
      },
    });
    const occupiedSlots = bookings.map((booking) => {
      const bookingDate = new Date(booking.date);
      const hours = bookingDate.getHours().toString().padStart(2, "0");
      const minutes = bookingDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    });

    let availableTimeSlots = TIME_SLOTS.filter(
      (slot) => !occupiedSlots.includes(slot),
    );

    // Se for hoje, filtrar horários que já passaram
    if (isToday(date)) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      availableTimeSlots = availableTimeSlots.filter((slot) => {
        const [slotHours, slotMinutes] = slot.split(":").map(Number);
        return (
          slotHours > currentHours ||
          (slotHours === currentHours && slotMinutes > currentMinutes)
        );
      });
    }

    return availableTimeSlots;
  });
