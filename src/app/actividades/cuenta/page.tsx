import Link from "next/link";
import { auth } from "@/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangePasswordForm } from "./change-password-form";

export default async function CuentaPage() {
  const session = await auth();

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
      <h1 className="mt-2 mb-6 text-2xl font-bold">Mi cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {session?.user?.name ?? "Sin nombre"}
          </CardTitle>
          <CardDescription>{session?.user?.email}</CardDescription>
        </CardHeader>
      </Card>

      <h2 className="mt-6 mb-3 text-lg font-semibold">Cambiar contraseña</h2>
      <ChangePasswordForm />
    </div>
  );
}
