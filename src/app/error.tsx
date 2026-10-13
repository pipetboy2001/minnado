"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <TriangleAlert className="size-14 text-destructive" />
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="max-w-md text-muted-foreground">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al
        inicio.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCcw />
          Reintentar
        </Button>
        <Button render={<Link href="/" />}>Volver al inicio</Button>
      </div>
    </div>
  );
}
