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
import { getLessonsN5 } from "@/content/loader";
import { getUserLessonProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { LessonTabs } from "./lesson-tabs";

export default async function ActividadesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;
  const lessons = getLessonsN5();
  const progress = await getUserLessonProgress(userId);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <Link href="/actividades" className="flex shrink-0 items-center gap-2">
          <Languages className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Minnado</span>
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            aria-label="Repaso"
            render={<Link href="/actividades/repaso" />}
          >
            <RotateCcw />
            <span className="hidden sm:inline">Repaso</span>
          </Button>
          <Button
            variant="outline"
            aria-label="Diccionario"
            render={<Link href="/actividades/diccionario" />}
          >
            <Library />
            <span className="hidden sm:inline">Diccionario</span>
          </Button>
          <Button
            variant="outline"
            aria-label="Examen"
            render={<Link href="/actividades/examen" />}
          >
            <GraduationCap />
            <span className="hidden sm:inline">Examen</span>
          </Button>
          <AccountMenu />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
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
