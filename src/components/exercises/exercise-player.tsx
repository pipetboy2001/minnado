"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/lib/speech";
import type { Exercise } from "@/types/exercise";
import { gradeExercise, type ExerciseAnswer } from "./grading";
import { EXERCISE_TYPE_META, ExerciseQuestion } from "./exercise-question";

export function ExercisePlayer({
  exercises: allExercises,
  lessonId,
}: {
  exercises: Exercise[];
  lessonId: string;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  // Defaults to unsupported so the first client render matches the SSR
  // render (no window) and avoids a hydration mismatch; corrected right
  // after mount, same pattern as ThemeToggle.
  const [canSpeak, setCanSpeak] = useState(false);
  const [canHear, setCanHear] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanSpeak(isSpeechRecognitionSupported());
    setCanHear(isSpeechSynthesisSupported());
  }, []);

  const exercises = useMemo(
    () =>
      allExercises.filter((e) => {
        if (e.type === "speaking") return canSpeak;
        if (e.type === "listening") return canHear;
        return true;
      }),
    [allExercises, canSpeak, canHear],
  );

  const exercise = exercises[index];
  const isFinished = index >= exercises.length;
  const isAnswered = answer !== undefined;
  const progress = (index / exercises.length) * 100;

  useEffect(() => {
    if (!isFinished) return;
    async function saveCompletion() {
      const [progressRes, sessionRes] = await Promise.all([
        fetch("/api/lesson-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        }),
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            score,
            totalExercises: exercises.length,
          }),
        }),
      ]);
      if (!progressRes.ok || !sessionRes.ok) {
        toast.error("No se pudo guardar tu progreso de esta lección.");
      }
    }
    void saveCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, lessonId]);

  async function handleCheck() {
    if (!answer) return;
    const isCorrect = gradeExercise(exercise, answer);
    setRevealed(true);
    setLastCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        userAnswer: answer,
      }),
    });
    if (!response.ok) {
      toast.error("No se pudo guardar este intento.");
    }
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setAnswer(undefined);
    setRevealed(false);
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground">
        Esta lección todavía no tiene ejercicios interactivos.
      </p>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="text-2xl font-bold">¡Práctica completa!</h2>
          <p className="text-lg">
            Puntaje: {score} / {exercises.length} ({percentage}%)
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIndex(0);
                setAnswer(undefined);
                setRevealed(false);
                setScore(0);
              }}
            >
              Reintentar
            </Button>
            <Button render={<Link href={`/actividades/${lessonId}`} />}>
              Volver a la lección
            </Button>
          </div>
          <Link
            href="/actividades/progreso"
            className="text-sm text-muted-foreground underline"
          >
            Ver mi progreso
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { icon: TypeIcon, label: typeLabel } =
    EXERCISE_TYPE_META[exercise.type];

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {index + 1} / {exercises.length}
            </span>
            <span>Puntaje: {score}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TypeIcon className="size-3.5" />
            {typeLabel}
          </span>
          <p className="text-base text-muted-foreground">{exercise.promptEs}</p>
        </div>

        <ExerciseQuestion
          exercise={exercise}
          value={answer}
          onChange={setAnswer}
          revealed={revealed}
          disabled={revealed}
        />

        {revealed && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-md p-3 text-sm",
              lastCorrect
                ? "bg-green-600/10 text-green-700 dark:text-green-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {lastCorrect ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {lastCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              {exercise.explanationEs && (
                <p className="mt-0.5 text-foreground/80">
                  {exercise.explanationEs}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!revealed ? (
            <Button onClick={() => void handleCheck()} disabled={!isAnswered}>
              Comprobar
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {index + 1 < exercises.length ? "Siguiente" : "Ver resultado"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
