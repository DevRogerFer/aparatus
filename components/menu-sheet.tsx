import { CalendarDays, Home, LogIn, LogOut, MenuIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const categories = [
  { label: "Cabelo", search: "cabelo" },
  { label: "Barba", search: "barba" },
  { label: "Acabamento", search: "acabamento" },
  { label: "Sobrancelha", search: "sobrancelha" },
  { label: "Massagem", search: "massagem" },
  { label: "Hidratação", search: "hidratação" },
];

const MenuSheet = () => {
  const isLoggedIn = false;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto rounded-r-xl">
        <SheetHeader className="border-border border-b pb-6">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-5 py-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop" />
              </Avatar>
              <div>
                <p className="text-foreground font-semibold">Pedro Lucas</p>
                <p className="text-muted-foreground text-xs">
                  pedrolucas@gmail.com
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-foreground font-semibold">
                Olá. Faça seu login!
              </p>
              <Button className="rounded-full">
                Login
                <LogIn className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <Button variant="ghost" className="justify-start gap-3" asChild>
            <Link href="/">
              <Home className="size-4" />
              Início
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-3" asChild>
            <Link href="/bookings">
              <CalendarDays className="size-4" />
              Agendamentos
            </Link>
          </Button>
        </div>

        <div className="border-border flex flex-col gap-1 border-b py-6">
          {categories.map((category) => (
            <Button
              key={category.search}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href={`/barbershops?search=${category.search}`}>
                {category.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-1 py-6">
          <Button
            variant="ghost"
            className="text-muted-foreground justify-start gap-3"
          >
            <LogOut className="size-4" />
            Sair da conta
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuSheet;
