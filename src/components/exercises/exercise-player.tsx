"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [score, setScore] = useState(0);

  const exercise = exercises[index];
  const isFinished = index >= exercises.length;
  const isAnswered = answer !== undefined;

  function handleCheck() {
    if (!answer) return;
    const isCorrect = gradeExercise(exercise, answer);
    setRevealed(true);
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Pregunta {index + 1} / {exercises.length}
          </span>
          <span>Puntaje: {score}</span>
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

        {revealed && exercise.explanationEs && (
          <p className="rounded-md bg-muted p-3 text-sm">
            {exercise.explanationEs}
          </p>
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
