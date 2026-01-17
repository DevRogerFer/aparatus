import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import MenuSheet from "./menu-sheet";

const Header = () => {
  return (
    <header className="bg-background flex items-center justify-between px-5 py-6">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Aparatus - Agende nos melhores"
          width={91}
          height={24}
        />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/chat"
          aria-label="Abrir chat de IA"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-md shadow transition-all"
        >
          <MessageCircle className="size-5" />
        </Link>
        <MenuSheet />
      </div>
    </header>
  );
};

export default Header;
