import BarbershopItem from "@/components/barbershop-item";
import Header from "@/components/header";
import { PageContainer, PageSectionContent } from "@/components/ui/page";
import { searchBarbershopsByService } from "@/data/barbershops";

interface BarbershopsPageProps {
  searchParams: Promise<{ search?: string }>;
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { search } = await searchParams;

  if (!search) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <PageContainer>
          <PageSectionContent>
            <h2 className="text-xl font-bold">Barbearias</h2>
            <p className="text-muted-foreground text-sm">
              Use a busca para encontrar barbearias por serviço.
            </p>
          </PageSectionContent>
        </PageContainer>
      </div>
    );
  }

  const barbershops = await searchBarbershopsByService(search);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PageContainer>
        <PageSectionContent>
          <h2 className="text-xl font-bold">
            Resultados para &quot;{search}&quot;
          </h2>
        </PageSectionContent>

        {barbershops.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        ) : (
          <PageSectionContent>
            <p className="text-muted-foreground text-sm">
              Nenhuma barbearia encontrada para &quot;{search}&quot;.
            </p>
          </PageSectionContent>
        )}
      </PageContainer>
    </div>
  );
};

export default BarbershopsPage;
