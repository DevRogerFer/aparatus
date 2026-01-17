import { NextResponse } from "next/server";
import Stripe from "stripe";
import z from "zod";

import { prisma } from "@/lib/prisma";

const metadataSchema = z.object({
  serviceId: z.uuid(),
  barbershopId: z.uuid(),
  userId: z.string(),
  date: z.iso.datetime(),
});

export const POST = async (request: Request) => {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET_KEY
  ) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }
  const signature = request.headers.get("Stripe-Signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_KEY,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = metadataSchema.parse(session.metadata);
    const date = new Date(metadata.date);
    await prisma.booking.create({
      data: {
        userId: metadata.userId,
        barbershopId: metadata.barbershopId,
        serviceId: metadata.serviceId,
        date: date,
      },
    });
  }
  return NextResponse.json({ received: true });
};
