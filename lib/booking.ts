export type BookingStatus = "confirmed" | "finished" | "cancelled";

interface BookingForStatus {
  date: Date;
  cancelledAt: Date | null;
}

export const getBookingStatus = (booking: BookingForStatus): BookingStatus => {
  if (booking.cancelledAt) return "cancelled";
  if (new Date(booking.date) < new Date()) return "finished";
  return "confirmed";
};

export const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  confirmed: { label: "Confirmado", variant: "default" },
  finished: { label: "Finalizado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};
