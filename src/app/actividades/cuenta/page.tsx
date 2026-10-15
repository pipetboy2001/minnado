import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Palette, Settings, UserCircle, Volume2 } from "lucide-react";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelectControl } from "@/components/theme-select-control";
import { SpeechSpeedControl } from "@/components/speech-speed-control";
import { ChangeNameForm } from "./change-name-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-sm flex-1 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/actividades"
          className="text-sm text-muted-foreground underline"
        >
          ← Volver a actividades
        </Link>
        <ThemeToggle />
      </div>
      <h1 className="mt-2 mb-6 flex items-center gap-2 text-2xl font-bold">
        <Settings className="size-6 text-muted-foreground" />
        Configuración
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="size-5 text-muted-foreground" />
            Tu cuenta
          </CardTitle>
          <CardDescription>{session.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeNameForm currentName={session.user.name ?? ""} />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Palette className="size-4 text-muted-foreground" />
            Tema
          </h2>
          <p className="text-sm text-muted-foreground">
            Claro, oscuro, o según el sistema.
          </p>
        </div>
        <ThemeSelectControl />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Volume2 className="size-4 text-muted-foreground" />
            Velocidad de audio
          </h2>
          <p className="text-sm text-muted-foreground">
            Aplica a toda la pronunciación del sitio.
          </p>
        </div>
        <SpeechSpeedControl />
      </div>

      <h2 className="mt-6 mb-3 flex items-center gap-2 text-lg font-semibold">
        <KeyRound className="size-4 text-muted-foreground" />
        Cambiar contraseña
      </h2>
      <ChangePasswordForm email={session.user.email ?? ""} />
    </div>
  );
}
