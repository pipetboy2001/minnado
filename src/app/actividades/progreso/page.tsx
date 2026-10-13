import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  History,
  Pencil,
  Percent,
  Target,
  Trophy,
} from "lucide-react";
import { auth } from "@/auth";
import {
  getUserOverallStats,
  getUserLessonProgress,
  getUserSessionStats,
  getRecentSessions,
} from "@/lib/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ProgresoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [stats, lessons, sessionStats, recentSessions] = await Promise.all([
    getUserOverallStats(userId),
    getUserLessonProgress(userId),
    getUserSessionStats(userId),
    getRecentSessions(userId),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/actividades"
          className="text-sm text-muted-foreground underline"
        >
          ← Volver a actividades
        </Link>
        <ThemeToggle />
      </div>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Mi progreso</h1>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{sessionStats.totalSessions}</p>
            <p className="text-xs text-muted-foreground">
              Sesiones completadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <Target className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {sessionStats.averageScorePercent}%
            </p>
            <p className="text-xs text-muted-foreground">
              Calificación promedio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <Trophy className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {sessionStats.bestScorePercent}%
            </p>
            <p className="text-xs text-muted-foreground">Mejor calificación</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <Pencil className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totalAttempts}</p>
            <p className="text-xs text-muted-foreground">
              Ejercicios intentados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.correctAttempts}</p>
            <p className="text-xs text-muted-foreground">
              Respuestas correctas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
            <Percent className="size-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Precisión general</p>
          </CardContent>
        </Card>
      </div>

      {recentSessions.length > 0 && (
        <>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <History className="size-5 text-muted-foreground" />
            Historial de sesiones
          </h2>
          <div className="mb-8 flex flex-col gap-2">
            {recentSessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{s.lessonTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormatter.format(s.completedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {s.score} / {s.totalExercises}
                    </p>
                    <p
                      className={
                        s.percentage >= 70
                          ? "text-xs text-green-600"
                          : "text-xs text-destructive"
                      }
                    >
                      {s.percentage}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <BookOpen className="size-5 text-muted-foreground" />
        Lecciones
      </h2>
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
