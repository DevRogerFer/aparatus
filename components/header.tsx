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
      <MenuSheet />
    </header>
  );
};

export default Header;
