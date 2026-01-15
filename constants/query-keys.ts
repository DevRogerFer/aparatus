const queryKeys = {
  getDateAvailableTimeSlots: (barbershopId: string, date: Date | undefined) => [
    "availableTimeSlots",
    barbershopId,
    date?.toISOString() ?? "",
  ],
};

export { queryKeys };
