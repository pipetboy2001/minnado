"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { WordOrderExercise } from "@/types/exercise";
import type { WordOrderAnswer } from "./grading";

export function WordOrderQuestion({
  exercise,
  onChange,
  revealed,
  disabled,
}: {
  exercise: WordOrderExercise;
  onChange: (answer: WordOrderAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  useEffect(() => {
    onChange({ order: usedIndices.map((i) => exercise.wordBank[i]) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedIndices]);

  const isCorrect =
    revealed &&
    usedIndices.length === exercise.correctOrder.length &&
    usedIndices.every(
      (i, pos) => exercise.wordBank[i] === exercise.correctOrder[pos],
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-lg border border-dashed p-3">
        {usedIndices.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Toca las palabras en orden...
          </span>
        )}
        {usedIndices.map((i, pos) => (
          <button
            key={pos}
            type="button"
            disabled={disabled}
            onClick={() =>
              setUsedIndices((prev) => prev.filter((_, p) => p !== pos))
            }
            className="rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-lg"
          >
            {exercise.wordBank[i]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {exercise.wordBank.map((word, i) =>
          usedIndices.includes(i) ? null : (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => setUsedIndices((prev) => [...prev, i])}
              className="rounded-md border px-3 py-1.5 text-lg hover:bg-muted"
            >
              {word}
            </button>
          ),
        )}
      </div>

      {revealed && (
        <p
          className={cn(
            "text-sm",
            isCorrect ? "text-green-600" : "text-destructive",
          )}
        >
          Orden correcto: {exercise.correctOrder.join(" ")}
        </p>
      )}
    </div>
  );
}
