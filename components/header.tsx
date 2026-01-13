import { MenuIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="bg-background flex items-center justify-between px-5 py-6">
      <Image src="/logo.svg" alt="Aparatus" width={91} height={24} />
      <Button variant="outline" size="icon">
        <MenuIcon />
      </Button>
    </header>
  );
};

export default Header;
