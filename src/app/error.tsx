"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="max-w-md text-muted-foreground">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al
        inicio.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
        <Button render={<Link href="/" />}>Volver al inicio</Button>
      </div>
    </div>
  );
}
