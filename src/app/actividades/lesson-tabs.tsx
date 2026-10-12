"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Lesson } from "@/types/content";
import type { LessonProgressSummary } from "@/lib/progress";

type Tab = "lesson" | "review";

export function LessonTabs({
  lessons,
  progress,
}: {
  lessons: Lesson[];
  progress: LessonProgressSummary[];
}) {
  const [tab, setTab] = useState<Tab>("lesson");

  const progressByLesson = useMemo(
    () => new Map(progress.map((p) => [p.lessonId, p])),
    [progress],
  );

  const realLessons = lessons.filter((l) => l.kind === "lesson");
  const reviewLessons = lessons.filter((l) => l.kind === "review");
  const visible = tab === "lesson" ? realLessons : reviewLessons;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={tab === "lesson" ? "default" : "outline"}
          onClick={() => setTab("lesson")}
        >
          Lecciones ({realLessons.length})
        </Button>
        <Button
          type="button"
          variant={tab === "review" ? "default" : "outline"}
          onClick={() => setTab("review")}
        >
          Repaso ({reviewLessons.length})
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {visible.map((lesson) => {
          const lessonProgress = progressByLesson.get(lesson.id);
          const percentage =
            lesson.exerciseIds.length === 0
              ? 0
              : Math.round(
                  ((lessonProgress?.masteredExercises ?? 0) /
                    lesson.exerciseIds.length) *
                    100,
                );
          return (
            <Link key={lesson.id} href={`/actividades/${lesson.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {lesson.title}
                    {lessonProgress?.completed && (
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
