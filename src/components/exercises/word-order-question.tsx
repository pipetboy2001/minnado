"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AutoFurigana } from "@/components/furigana";
import { SpeakButton } from "@/components/speak-button";
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
      <div
        className={cn(
          "flex min-h-12 flex-wrap gap-2 rounded-lg border-2 border-dashed p-3 transition-colors",
          revealed && (isCorrect ? "border-green-600" : "border-destructive"),
        )}
      >
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
            className="scale-100 rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-lg shadow-sm transition-transform hover:scale-105"
          >
            <AutoFurigana text={exercise.wordBank[i]} />
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
              className="rounded-md border px-3 py-1.5 text-lg transition-transform hover:scale-105 hover:bg-muted"
            >
              <AutoFurigana text={word} />
            </button>
          ),
        )}
      </div>

      {revealed && (
        <div className="flex items-center gap-1">
          {!isCorrect && (
            <p className="animate-shake text-sm text-destructive">
              Orden correcto: {exercise.correctOrder.join(" ")}
            </p>
          )}
          <SpeakButton text={exercise.correctOrder.join("")} />
        </div>
      )}
    </div>
  );
}
