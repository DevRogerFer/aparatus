"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import BookingItem from "@/components/booking-item";
import Header from "@/components/header";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import { BookingWithServiceAndBarbershop } from "@/data/booking";
import { authClient } from "@/lib/auth-client";

interface BookingsPageContentProps {
  confirmed: BookingWithServiceAndBarbershop[];
  finished: BookingWithServiceAndBarbershop[];
}

const BookingsPageContent = ({
  confirmed,
  finished,
}: BookingsPageContentProps) => {
  return (
    <>
      <PageSectionContent>
        <PageSectionTitle>Confirmados</PageSectionTitle>
        {confirmed.length > 0 ? (
          <div className="space-y-3">
            {confirmed.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Você não possui agendamentos confirmados.
          </p>
        )}
      </PageSectionContent>

      <PageSectionContent>
        <PageSectionTitle>Finalizados</PageSectionTitle>
        {finished.length > 0 ? (
          <div className="space-y-3">
            {finished.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Você não possui agendamentos finalizados.
          </p>
        )}
      </PageSectionContent>
    </>
  );
};

interface BookingsClientPageProps {
  confirmed: BookingWithServiceAndBarbershop[];
  finished: BookingWithServiceAndBarbershop[];
}

const BookingsClientPage = ({
  confirmed,
  finished,
}: BookingsClientPageProps) => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";
  const retriesRef = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!isPending && !session && !paymentSuccess) {
      toast.error("Não autorizado. Por favor, faça login para continuar.");
      authClient.signIn.social({ provider: "google" });
    }
  }, [session, isPending, paymentSuccess]);

  // Quando redirecionado do Stripe com ?payment=success, faz polling
  // até o webhook criar o booking e os dados aparecerem na página
  const previousConfirmedCount = useRef(confirmed.length);
  useEffect(() => {
    if (!paymentSuccess) return;

    // Se já apareceu um novo booking, limpa a URL e para
    if (confirmed.length > previousConfirmedCount.current) {
      toast.success("Agendamento confirmado com sucesso!");
      router.replace("/bookings");
      return;
    }

    if (retriesRef.current >= maxRetries) {
      toast.success(
        "Pagamento confirmado! Seu agendamento aparecerá em breve.",
      );
      router.replace("/bookings");
      return;
    }

    const timer = setTimeout(() => {
      retriesRef.current += 1;
      router.refresh();
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentSuccess, confirmed.length, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <PageContainer>
          <h2 className="text-xl font-bold">Agendamentos</h2>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </PageContainer>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <PageContainer>
          <h2 className="text-xl font-bold">Agendamentos</h2>
          <p className="text-muted-foreground text-sm">
            Redirecionando para login...
          </p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PageContainer>
        <h2 className="text-xl font-bold">Agendamentos</h2>
        <BookingsPageContent confirmed={confirmed} finished={finished} />
      </PageContainer>
    </div>
  );
};

export default BookingsClientPage;
