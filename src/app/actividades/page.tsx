import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GraduationCap,
  Languages,
  Library,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { getLessonsN5, getLessonsN4 } from "@/content/loader";
import { getUserLessonProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { MobileNav } from "@/components/mobile-nav";
import { LessonTabs } from "./lesson-tabs";

export default async function ActividadesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;
  const lessons = [...getLessonsN5(), ...getLessonsN4()];
  const progress = await getUserLessonProgress(userId, lessons);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <Link href="/actividades" className="flex shrink-0 items-center gap-2">
          <Languages className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Minnado</span>
        </Link>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            render={<Link href="/actividades/repaso" />}
          >
            <RotateCcw />
            Repaso
          </Button>
          <Button
            variant="outline"
            render={<Link href="/actividades/diccionario" />}
          >
            <Library />
            Diccionario
          </Button>
          <Button
            variant="outline"
            render={<Link href="/actividades/examen" />}
          >
            <GraduationCap />
            Examen
          </Button>
          <AccountMenu />
          <form action={signOutAction}>
            <Button
              variant="outline"
              size="icon"
              type="submit"
              aria-label="Cerrar sesión"
            >
              <LogOut />
            </Button>
          </form>
        </div>
        <MobileNav
          logoutForm={
            <form action={signOutAction}>
              <Button
                variant="ghost"
                type="submit"
                className="w-full justify-start gap-2.5 px-3"
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </Button>
            </form>
          }
        />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Actividades</h1>
        <p className="text-sm text-muted-foreground">
          Hola, {session.user.name ?? session.user.email}
        </p>
      </div>

      <LessonTabs lessons={lessons} progress={progress} />
    </div>
  );
}
