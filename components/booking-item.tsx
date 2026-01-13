import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

const BookingItem = () => {
  return (
    <Card className="flex h-full w-full cursor-pointer flex-row items-center justify-between p-0">
      {/* ESQUERDA*/}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Badge>Confirmado</Badge>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Corte de Cabelo</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png" />
            </Avatar>
            <p className="text-sm font-medium">Barbearia do João</p>
          </div>
        </div>
      </div>
      {/* DIREITA*/}
      <div className="flex h-full w-[106px] flex-col items-center justify-center border-l py-3">
        <p className="text-xs capitalize">Fevereiro</p>
        <p className="text-2xl">13</p>
        <p className="text-xs">09:45</p>
      </div>
    </Card>
  );
};

export default BookingItem;
