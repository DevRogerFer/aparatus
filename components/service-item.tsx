import Image from "next/image";

import { BarbershopService } from "@/generated/prisma/browser";
import { formatPrice } from "@/lib/utils";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface ServiceItemProps {
  service: BarbershopService;
}

const ServiceItem = ({ service }: ServiceItemProps) => {
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
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
