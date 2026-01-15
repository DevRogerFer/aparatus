import { MapPinIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import BackButton from "@/components/back-button";
import PhoneItem from "@/components/phone-item";
import ServiceItem from "@/components/service-item";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import { getBarbershopById } from "@/data/barbershops";

interface BarbershopPageProps {
  params: Promise<{ id: string }>;
}

export default async function BarbershopPage({ params }: BarbershopPageProps) {
  const { id } = await params;
  const barbershop = await getBarbershopById(id);

  if (!barbershop) {
    notFound();
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-62.5 w-full">
        <BackButton />
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-black to-transparent" />
      </div>

      <div className="bg-background relative -mt-5 rounded-t-3xl">
        <PageContainer>
          {/* Info */}
          <PageSectionContent>
            <h1 className="text-xl font-bold">{barbershop.name}</h1>
            <div className="flex items-center gap-2">
              <MapPinIcon className="text-primary size-4" />
              <span className="text-muted-foreground text-sm">
                {barbershop.address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="text-primary size-4 fill-current" />
              <span className="text-muted-foreground text-sm">
                5.0 (499 avaliações)
              </span>
            </div>
          </PageSectionContent>

          {/* Description */}
          <PageSectionContent>
            <PageSectionTitle>Sobre nós</PageSectionTitle>
            <p className="text-muted-foreground text-sm">
              {barbershop.description}
            </p>
          </PageSectionContent>

          {/* Services */}
          <PageSectionContent>
            <PageSectionTitle>Serviços</PageSectionTitle>
            <div className="flex flex-col gap-3">
              {barbershop.services.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  barbershop={barbershop}
                />
              ))}
            </div>
          </PageSectionContent>

          {/* Phones */}
          <PageSectionContent>
            <PageSectionTitle>Contato</PageSectionTitle>
            <div className="flex flex-col gap-3">
              {barbershop.phones.map((phone, index) => (
                <PhoneItem key={index} phone={phone} />
              ))}
            </div>
          </PageSectionContent>
        </PageContainer>
      </div>
    </div>
  );
}
