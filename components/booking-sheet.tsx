"use client";

import { Loader2, Smartphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cancelBooking } from "@/actions/cancel-booking";
import CopyButton from "@/app/barbershops/[id]/_components/copy-button";
import { BookingWithServiceAndBarbershop } from "@/data/booking";
import { getBookingStatus } from "@/lib/booking";

import BookingSummary from "./booking-summary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface BookingSheetProps {
  booking: BookingWithServiceAndBarbershop;
  children: React.ReactNode;
}

const BookingSheet = ({ booking, children }: BookingSheetProps) => {
  const router = useRouter();
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const { executeAsync: executeCancelBooking, isPending: isCancelling } =
    useAction(cancelBooking);

  const status = getBookingStatus(booking);
  const canCancel = status === "confirmed";

  const handleCancelBooking = async () => {
    const result = await executeCancelBooking({ bookingId: booking.id });
    if (result?.validationErrors) {
      return toast.error(result.validationErrors._errors?.[0]);
    }
    if (result?.serverError) {
      return toast.error(
        "Erro ao cancelar agendamento. Por favor, tente novamente.",
      );
    }
    toast.success("Agendamento cancelado com sucesso!");
    setSheetIsOpen(false);
    router.refresh();
  };

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-0">
        <SheetHeader className="px-5">
          <SheetTitle>Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          <div className="relative h-45 w-full overflow-hidden rounded-xl">
            <Image
              src="/map.png"
              alt="Mapa da barbearia"
              fill
              className="object-cover"
            />
            <div className="absolute right-4 bottom-4 left-4">
              <div className="bg-card flex items-center gap-3 rounded-xl p-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={booking.service.barbershop.imageUrl} />
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-bold">{booking.service.barbershop.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {booking.service.barbershop.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <BookingSummary
            serviceName={booking.service.name}
            priceInCents={booking.service.priceInCents}
            barbershopName={booking.service.barbershop.name}
            date={booking.date}
            status={status}
          />

          <div className="flex flex-col gap-3">
            {booking.service.barbershop.phones.map((phone) => (
              <div key={phone} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-6" />
                  <span className="text-sm">{phone}</span>
                </div>
                <CopyButton text={phone} />
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 px-5">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1">
              Voltar
            </Button>
          </SheetClose>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  Cancelar Reserva
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar este agendamento? Esta ação
                    não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Confirmar"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingSheet;
