import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth, signOut } from "@/auth";
import { getLessonsN5 } from "@/content/loader";
import { getUserLessonProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ActividadesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const lessons = getLessonsN5();
  const progressByLesson = new Map(
    (await getUserLessonProgress(userId)).map((p) => [p.lessonId, p]),
  );

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

      <div className="flex flex-col gap-4">
        {lessons.map((lesson) => {
          const progress = progressByLesson.get(lesson.id);
          const percentage =
            lesson.exerciseIds.length === 0
              ? 0
              : Math.round(
                  ((progress?.masteredExercises ?? 0) /
                    lesson.exerciseIds.length) *
                    100,
                );
          return (
            <Link key={lesson.id} href={`/actividades/${lesson.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {lesson.title}
                    {progress?.completed && (
                      <CheckCircle2 className="size-4 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{lesson.vocabIds.length} palabras</span>
                    <span>{lesson.kanjiIds.length} kanji</span>
                    <span>{lesson.grammarIds.length} reglas de gramática</span>
                    <span>{lesson.exerciseIds.length} ejercicios</span>
                  </div>
                  {percentage > 0 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
