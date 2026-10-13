import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <SearchX className="size-14 text-muted-foreground" />
      <h1 className="text-2xl font-bold">404 — Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        Esta página no existe, o quizás la lección que buscas todavía no se ha
        agregado.
      </p>
      <Button render={<Link href="/" />}>Volver al inicio</Button>
    </div>
  );
}
