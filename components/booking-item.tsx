import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BookingWithServiceAndBarbershop } from "@/data/booking";

import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

type BookingStatus = "confirmed" | "finished" | "cancelled";

interface BookingItemProps {
  booking: BookingWithServiceAndBarbershop;
}

const getBookingStatus = (
  booking: BookingWithServiceAndBarbershop,
): BookingStatus => {
  if (booking.cancelledAt) return "cancelled";
  if (new Date(booking.date) < new Date()) return "finished";
  return "confirmed";
};

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  confirmed: { label: "Confirmado", variant: "default" },
  finished: { label: "Finalizado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const BookingItem = ({ booking }: BookingItemProps) => {
  const status = getBookingStatus(booking);
  const { label, variant } = statusConfig[status];
  const bookingDate = new Date(booking.date);

  return (
    <Card className="flex h-full w-full cursor-pointer flex-row items-center justify-between p-0">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Badge variant={variant}>{label}</Badge>
        <div className="flex flex-col gap-2">
          <p className="font-bold">{booking.service.name}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={booking.service.barbershop.imageUrl} />
            </Avatar>
            <p className="text-sm font-medium">
              {booking.service.barbershop.name}
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-full w-26.5 flex-col items-center justify-center border-l py-3">
        <p className="text-xs capitalize">
          {format(bookingDate, "MMMM", { locale: ptBR })}
        </p>
        <p className="text-2xl">{format(bookingDate, "dd")}</p>
        <p className="text-xs">{format(bookingDate, "HH:mm")}</p>
      </div>
    </Card>
  );
};

export default BookingItem;
