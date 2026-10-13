import Link from "next/link";
import { ArrowRight, Languages, LogIn, UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Languages className="size-10 text-primary" />
      <h1 className="text-4xl font-bold tracking-tight">Minnado</h1>
      <p className="max-w-md text-muted-foreground">
        Plataforma open source para practicar japonés N5 basada en Minna no
        Nihongo — vocabulario, kanji, gramática y ejercicios interactivos.
      </p>
      <div className="flex gap-4">
        {session?.user ? (
          <Button render={<Link href="/actividades" />}>
            Ir a mis actividades
            <ArrowRight />
          </Button>
        ) : (
          <>
            <Button render={<Link href="/login" />}>
              <LogIn />
              Iniciar sesión
            </Button>
            <Button variant="outline" render={<Link href="/register" />}>
              <UserPlus />
              Crear cuenta
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
