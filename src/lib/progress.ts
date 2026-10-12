import { prisma } from "@/lib/prisma";
import { getLessonsN5 } from "@/content/loader";

export interface OverallStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface LessonProgressSummary {
  lessonId: string;
  title: string;
  totalExercises: number;
  masteredExercises: number;
  completed: boolean;
  completedAt: Date | null;
}

export async function getUserOverallStats(
  userId: string,
): Promise<OverallStats> {
  const attempts = await prisma.userExerciseAttempt.findMany({
    where: { userId },
    select: { isCorrect: true },
  });

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracy =
    totalAttempts === 0
      ? 0
      : Math.round((correctAttempts / totalAttempts) * 100);

  return { totalAttempts, correctAttempts, accuracy };
}

export async function getUserLessonProgress(
  userId: string,
): Promise<LessonProgressSummary[]> {
  const [attempts, progressRows] = await Promise.all([
    prisma.userExerciseAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: "asc" },
      select: { exerciseId: true, isCorrect: true },
    }),
    prisma.userLessonProgress.findMany({ where: { userId } }),
  ]);

  // Last attempt per exercise wins, so a lesson reflects current mastery
  // rather than "was ever answered correctly once".
  const latestByExercise = new Map<string, boolean>();
  for (const attempt of attempts) {
    latestByExercise.set(attempt.exerciseId, attempt.isCorrect);
  }

  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  return getLessonsN5().map((lesson) => {
    const masteredExercises = lesson.exerciseIds.filter(
      (id) => latestByExercise.get(id) === true,
    ).length;
    const progress = progressByLesson.get(lesson.id);

    return {
      lessonId: lesson.id,
      title: lesson.title,
      totalExercises: lesson.exerciseIds.length,
      masteredExercises,
      completed: progress?.completed ?? false,
      completedAt: progress?.completedAt ?? null,
    };
  });
}
