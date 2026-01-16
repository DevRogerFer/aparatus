import { prisma } from "@/lib/prisma";

export const getUserBookings = async (userId: string) => {
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
  });

  const confirmed = bookings
    .filter((booking) => !booking.cancelledAt && new Date(booking.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const finished = bookings
    .filter((booking) => booking.cancelledAt || new Date(booking.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { confirmed, finished };
};

export const getUserNextBooking = async (userId: string) => {
  const now = new Date();

  const nextBooking = await prisma.booking.findFirst({
    where: {
      userId,
      cancelledAt: null,
      date: {
        gte: now,
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return nextBooking;
};

export type BookingWithServiceAndBarbershop = Awaited<
  ReturnType<typeof getUserBookings>
>["confirmed"][number];
