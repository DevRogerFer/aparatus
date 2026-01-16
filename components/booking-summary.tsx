import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BookingStatus, bookingStatusConfig } from "@/lib/booking";
import { formatPrice } from "@/lib/utils";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface BookingSummaryProps {
  serviceName: string;
  priceInCents: number;
  barbershopName: string;
  date: Date;
  status?: BookingStatus;
}

const BookingSummary = ({
  serviceName,
  priceInCents,
  barbershopName,
  date,
  status,
}: BookingSummaryProps) => {
  const bookingDate = new Date(date);
  const statusInfo = status ? bookingStatusConfig[status] : null;

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col gap-3 p-3">
        {statusInfo && (
          <Badge variant={statusInfo.variant} className="w-fit">
            {statusInfo.label}
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-bold">{serviceName}</h3>
          <span className="text-sm font-bold">{formatPrice(priceInCents)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Data</span>
          <span className="text-sm">
            {format(bookingDate, "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Horário</span>
          <span className="text-sm">{format(bookingDate, "HH:mm")}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Barbearia</span>
          <span className="text-sm">{barbershopName}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
