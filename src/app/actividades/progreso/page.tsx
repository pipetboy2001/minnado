import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { getUserOverallStats, getUserLessonProgress } from "@/lib/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProgresoPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [stats, lessons] = await Promise.all([
    getUserOverallStats(userId),
    getUserLessonProgress(userId),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Mi progreso</h1>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalAttempts}</p>
            <p className="text-xs text-muted-foreground">
              Ejercicios intentados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.correctAttempts}</p>
            <p className="text-xs text-muted-foreground">
              Respuestas correctas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Precisión</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Lecciones</h2>
      <div className="flex flex-col gap-3">
        {lessons.map((lesson) => {
          const percentage =
            lesson.totalExercises === 0
              ? 0
              : Math.round(
                  (lesson.masteredExercises / lesson.totalExercises) * 100,
                );
          return (
            <Card key={lesson.lessonId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {lesson.title}
                  {lesson.completed && (
                    <CheckCircle2 className="size-4 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription>
                  {lesson.masteredExercises} / {lesson.totalExercises}{" "}
                  ejercicios dominados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
