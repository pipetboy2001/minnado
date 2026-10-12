import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">にほんご</h1>
      <p className="max-w-md text-muted-foreground">
        Plataforma open source para practicar japonés N5/N4 basada en Minna no
        Nihongo — vocabulario, kanji, gramática y ejercicios interactivos.
      </p>
      <div className="flex gap-4">
        {session?.user ? (
          <Button render={<Link href="/actividades" />}>
            Ir a mis actividades
          </Button>
        ) : (
          <>
            <Button render={<Link href="/login" />}>Iniciar sesión</Button>
            <Button variant="outline" render={<Link href="/register" />}>
              Crear cuenta
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
