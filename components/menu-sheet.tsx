"use client";

import { CalendarDays, Home, LogIn, LogOut, MenuIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  const { data: session } = authClient.useSession();
  const handleLogin = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
  };
  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
  };
  const isLoggedIn = !!session?.user;
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
              <Avatar className="size-12">
                <AvatarImage
                  src={session.user.image ?? ""}
                  alt={session.user.name}
                />
                <AvatarFallback>
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{session.user.name}</span>
                <span className="text-muted-foreground text-sm">
                  {session.user.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-foreground font-semibold">
                Olá. Faça seu login!
              </p>
              <Button className="rounded-full" onClick={handleLogin}>
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
          {isLoggedIn && (
            <Button
              variant="ghost"
              className="justify-left w-fit text-left"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sair da conta
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuSheet;
