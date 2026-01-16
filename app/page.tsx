import { headers } from "next/headers";
import Image from "next/image";

import BarbershopItem from "@/components/barbershop-item";
import BookingItem from "@/components/booking-item";
import Header from "@/components/header";
import {
  PageContainer,
  PageSectionContent,
  PageSectionScroller,
  PageSectionTitle,
} from "@/components/ui/page";
import QuickSearch from "@/components/ui/quick-search";
import Search from "@/components/ui/search";
import { getBarbershops, getPopularBarbershops } from "@/data/barbershops";
import { getUserConfirmedBookings } from "@/data/booking";
import { auth } from "@/lib/auth";
import banner from "@/public/banner.png";

// Server Component
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const barbershops = await getBarbershops();
  const popularBarbershops = await getPopularBarbershops();
  const confirmedBookings = session?.user
    ? await getUserConfirmedBookings(session.user.id)
    : [];
  return (
    <div>
      <Header />
      <PageContainer>
        <Search />
        <QuickSearch />
        <Image
          src={banner}
          alt="Agende nos melhores com a Aparatus"
          sizes="100vw"
          className="h-auto w-full"
        />
        <PageSectionContent>
          <PageSectionTitle>Agendamentos</PageSectionTitle>
          {confirmedBookings.length > 0 ? (
            <PageSectionScroller>
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </PageSectionScroller>
          ) : (
            <p className="text-muted-foreground text-sm">
              Você não possui agendamentos.
            </p>
          )}
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
