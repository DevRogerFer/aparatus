import { prisma } from "@/lib/prisma";

// Data Access Layer
export const getBarbershops = async () => {
  const barbershops = await prisma.barbershop.findMany();
  return barbershops;
};

export const getPopularBarbershops = async () => {
  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  });
  return popularBarbershops;
};

export const getBarbershopById = async (id: string) => {
  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: { services: true },
  });
  return barbershop;
};

export const searchBarbershopsByService = async (searchTerm: string) => {
  const barbershops = await prisma.barbershop.findMany({
    where: {
      services: {
        some: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
    },
  });
  return barbershops;
};
