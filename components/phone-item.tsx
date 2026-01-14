"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface PhoneItemProps {
  phone: string;
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(phone);
    toast.success("Telefone copiado!");
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{phone}</span>
      <Button size="sm" variant="outline" onClick={handleCopy}>
        <CopyIcon className="mr-1" />
        Copiar
      </Button>
    </div>
  );
};

export default PhoneItem;
