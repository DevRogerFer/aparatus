import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function checkData() {
  const barbershops = await prisma.barbershop.findMany({
    include: {
      services: true,
    },
  });

  console.log(`Total de barbearias: ${barbershops.length}`);
  console.log(`Primeira barbearia:`, barbershops[0]);

  await prisma.$disconnect();
}

checkData();
