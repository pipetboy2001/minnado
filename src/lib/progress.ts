import { prisma } from "@/lib/prisma";
import type { Lesson } from "@/types/content";

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

export interface SessionStats {
  totalSessions: number;
  averageScorePercent: number;
  bestScorePercent: number;
}

export interface SessionSummary {
  id: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  totalExercises: number;
  percentage: number;
  completedAt: Date;
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
  lessons: Lesson[],
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

  return lessons.map((lesson) => {
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

export async function getUserSessionStats(
  userId: string,
): Promise<SessionStats> {
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    select: { score: true, totalExercises: true },
  });

  if (sessions.length === 0) {
    return { totalSessions: 0, averageScorePercent: 0, bestScorePercent: 0 };
  }

  const percentages = sessions.map((s) =>
    s.totalExercises === 0 ? 0 : Math.round((s.score / s.totalExercises) * 100),
  );

  return {
    totalSessions: sessions.length,
    averageScorePercent: Math.round(
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    ),
    bestScorePercent: Math.max(...percentages),
  };
}

export async function getRecentSessions(
  userId: string,
  limit = 10,
): Promise<SessionSummary[]> {
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: limit,
    include: { lesson: { select: { title: true } } },
  });

  return sessions.map((s) => ({
    id: s.id,
    lessonId: s.lessonId,
    lessonTitle: s.lesson.title,
    score: s.score,
    totalExercises: s.totalExercises,
    percentage:
      s.totalExercises === 0
        ? 0
        : Math.round((s.score / s.totalExercises) * 100),
    completedAt: s.completedAt,
  }));
}
