"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute top-4 left-4 z-10"
      onClick={() => router.back()}
    >
      <ChevronLeftIcon />
    </Button>
  );
};

export default BackButton;
