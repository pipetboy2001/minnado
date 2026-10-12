import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getLessonsN5 } from "@/content/loader";
import { getUserLessonProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LessonTabs } from "./lesson-tabs";

export default async function ActividadesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const lessons = getLessonsN5();
  const progress = await getUserLessonProgress(userId);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actividades N5</h1>
          <p className="text-sm text-muted-foreground">
            Hola, {session?.user?.name ?? session?.user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            render={<Link href="/actividades/repaso" />}
          >
            Repaso
          </Button>
          <Button
            variant="outline"
            render={<Link href="/actividades/diccionario" />}
          >
            Diccionario
          </Button>
          <Button
            variant="outline"
            render={<Link href="/actividades/progreso" />}
          >
            Mi progreso
          </Button>
          <Button
            variant="outline"
            render={<Link href="/actividades/cuenta" />}
          >
            Mi cuenta
          </Button>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="outline" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>

      <LessonTabs lessons={lessons} progress={progress} />
    </div>
  );
}
