"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/exercise";
import { gradeExercise, type ExerciseAnswer } from "./grading";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { WordOrderQuestion } from "./word-order-question";
import { MatchingQuestion } from "./matching-question";

export function ExercisePlayer({
  exercises,
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

  const exercise = exercises[index];
  const isFinished = index >= exercises.length;
  const isAnswered = answer !== undefined;
  const progress = (index / exercises.length) * 100;

  function handleCheck() {
    if (!answer) return;
    const isCorrect = gradeExercise(exercise, answer);
    setRevealed(true);
    setLastCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);

    void fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        isCorrect,
        userAnswer: answer,
      }),
    });
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
        </CardContent>
      </Card>
    );
  }

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

        <p className="text-base text-muted-foreground">{exercise.promptEs}</p>

        {exercise.type === "multiple-choice" && (
          <MultipleChoiceQuestion
            key={exercise.id}
            exercise={exercise}
            value={answer as never}
            onChange={setAnswer}
            revealed={revealed}
            disabled={revealed}
          />
        )}
        {exercise.type === "fill-in-blank" && (
          <FillInBlankQuestion
            key={exercise.id}
            exercise={exercise}
            value={answer as never}
            onChange={setAnswer}
            revealed={revealed}
            disabled={revealed}
          />
        )}
        {exercise.type === "word-order" && (
          <WordOrderQuestion
            key={exercise.id}
            exercise={exercise}
            onChange={setAnswer}
            revealed={revealed}
            disabled={revealed}
          />
        )}
        {exercise.type === "matching" && (
          <MatchingQuestion
            key={exercise.id}
            exercise={exercise}
            value={answer as never}
            onChange={setAnswer}
            revealed={revealed}
            disabled={revealed}
          />
        )}

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
            <Button onClick={handleCheck} disabled={!isAnswered}>
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
