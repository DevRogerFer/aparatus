import Image from "next/image";

import MenuSheet from "./menu-sheet";

const Header = () => {
  return (
    <header className="bg-background flex items-center justify-between px-5 py-6">
      <Image src="/logo.svg" alt="Aparatus" width={91} height={24} />
      <MenuSheet />
    </header>
  );
};

export default Header;
