"use client";

import { useQuery } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { createBooking } from "@/actions/create-booking";
import { getDateAvailableTimeSlots } from "@/actions/get-date-available-time-slots";
import { queryKeys } from "@/constants/query-keys";
import { Barbershop, BarbershopService } from "@/generated/prisma/browser";
import { useGetDateAvailableTimeSlots } from "@/hooks/data/useGetDateAvailableTimeSlots";
import { formatPrice } from "@/lib/utils";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card, CardContent } from "./ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface ServiceItemProps {
  service: BarbershopService;
  barbershop: Barbershop;
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );

  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const { executeAsync: executeCreateBooking, isPending: isCreatingBooking } =
    useAction(createBooking);

  const { data: availableTimeSlotsResult, isLoading: isLoadingTimeSlots } =
    useGetDateAvailableTimeSlots({
      barbershopId: barbershop.id,
      date: selectedDay,
    });

  const availableTimeSlots = availableTimeSlotsResult?.data ?? [];

  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleMonthChange = (month: Date) => {
    setDisplayedMonth(month);
  };

  const isSelectedDayValid = useMemo(() => {
    if (!selectedDay) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDay);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  }, [selectedDay]);

  const isSelectedDayInDisplayedMonth = useMemo(() => {
    if (!selectedDay) return false;
    return (
      selectedDay.getMonth() === displayedMonth.getMonth() &&
      selectedDay.getFullYear() === displayedMonth.getFullYear()
    );
  }, [selectedDay, displayedMonth]);

  const showTimeSlots = isSelectedDayValid && isSelectedDayInDisplayedMonth;

  const handleConfirmBooking = async () => {
    if (!selectedDay || !selectedTime) {
      return;
    }
    const splittedTime = selectedTime.split(":");
    const hours = Number(splittedTime[0]);
    const minutes = Number(splittedTime[1]);
    const date = new Date(selectedDay);
    date.setHours(hours, minutes);
    const result = await executeCreateBooking({
      date,
      serviceId: service.id,
    });
    if (result.validationErrors) {
      return toast.error(result.validationErrors._errors?.[0]);
    }
    if (result.serverError) {
      return toast.error(
        "Erro ao criar agendamento. Por favor, tente novamente.",
      );
    }
    toast.success("Agendamento criado com sucesso!");
    setSheetIsOpen(false);
    setSelectedDay(undefined);
    setSelectedTime(undefined);
  };

  const selectedDateTime = useMemo(() => {
    if (!selectedDay || !selectedTime) return null;

    return new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      Number(selectedTime.split(":")[0]),
      Number(selectedTime.split(":")[1]),
    );
  }, [selectedDay, selectedTime]);

  return (
    <Card className="bg-secondary flex-row items-center gap-3 p-3">
      <div className="relative h-27.5 min-h-27.5 w-27.5 min-w-27.5 overflow-hidden rounded-xl">
        <Image
          src={service.imageUrl}
          alt={service.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <h3 className="text-sm font-bold">{service.name}</h3>
        <p className="text-muted-foreground text-sm">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary text-sm font-bold">
            {formatPrice(service.priceInCents)}
          </span>
          <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                Reservar
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl px-0">
              <SheetHeader className="px-5">
                <SheetTitle>Fazer Reserva</SheetTitle>
              </SheetHeader>

              <div className="border-border border-b" />

              <div className="flex flex-col overflow-y-auto py-5">
                <div className="px-5">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={selectedDay}
                    onSelect={handleDaySelect}
                    onMonthChange={handleMonthChange}
                    disabled={{ before: new Date() }}
                    className="mx-auto w-full capitalize"
                  />
                </div>

                {showTimeSlots && (
                  <>
                    <div className="border-border mt-5 border-b" />

                    <div className="flex gap-3 overflow-x-auto px-5 py-5 [&::-webkit-scrollbar]:hidden">
                      {isLoadingTimeSlots ? (
                        <div className="flex w-full items-center justify-center">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-muted-foreground w-full text-center text-sm">
                          Nenhum horário disponível para esta data.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {selectedDateTime && isSelectedDayInDisplayedMonth && (
                  <>
                    <div className="border-border border-b" />

                    <div className="px-5 pt-5">
                      <Card className="bg-card">
                        <CardContent className="flex flex-col gap-3 p-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{service.name}</h3>
                            <span className="text-sm font-bold">
                              {formatPrice(service.priceInCents)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Data
                            </span>
                            <span className="text-sm">
                              {selectedDateTime.toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Horário
                            </span>
                            <span className="text-sm">{selectedTime}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Barbearia
                            </span>
                            <span className="text-sm">{barbershop.name}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>

              <SheetFooter className="px-5">
                <Button
                  disabled={!selectedDay || !selectedTime || isCreatingBooking}
                  className="w-full"
                  onClick={handleConfirmBooking}
                >
                  {isCreatingBooking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
