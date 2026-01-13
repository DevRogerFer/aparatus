import Image from "next/image";

import BarbershopItem from "@/components/barbershop-item";
import BookingItem from "@/components/booking-item";
import Header from "@/components/header";
import Footer from "@/components/ui/footer";
import {
  PageContainer,
  PageSectionContent,
  PageSectionScroller,
  PageSectionTitle,
} from "@/components/ui/page";
import { getBarbershops, getPopularBarbershops } from "@/data/barbershops";
import banner from "@/public/banner.png";

// Server Component
export default async function Home() {
  // pega todas as barbearias cadastradas
  const barbershops = await getBarbershops();
  const popularBarbershops = await getPopularBarbershops();
  return (
    <div>
      <Header />
      <PageContainer>
        <Image
          src={banner}
          alt="Agende nos melhores com a Aparatus"
          sizes="100vw"
          className="h-auto w-full"
        />
        <PageSectionContent>
          {/* Composition Pattern */}
          <PageSectionTitle>Agendamentos</PageSectionTitle>
          <BookingItem />
        </PageSectionContent>

        <PageSectionContent>
          <PageSectionTitle>Barbearias</PageSectionTitle>
        </PageSectionContent>
        <PageSectionScroller>
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </PageSectionScroller>
        <PageSectionContent>
          <PageSectionTitle>Barbearias Populares</PageSectionTitle>
        </PageSectionContent>
        <PageSectionScroller>
          {popularBarbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </PageSectionScroller>
      </PageContainer>
    </div>
  );
}
