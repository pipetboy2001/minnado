"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AutoFurigana } from "@/components/furigana";
import type { MatchingExercise } from "@/types/exercise";
import type { MatchingAnswer } from "./grading";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function MatchingQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: MatchingExercise;
  value?: MatchingAnswer;
  onChange: (answer: MatchingAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  const rightOptions = useMemo(
    () => shuffle(exercise.pairs.map((p) => p.right)),
    [exercise.id],
  );
  const selections = value?.selections ?? {};

  function setSelection(pairId: string, right: string) {
    onChange({ selections: { ...selections, [pairId]: right } });
  }

  return (
    <div className="flex flex-col gap-3">
      {exercise.pairs.map((pair) => {
        const selected = selections[pair.id];
        const isCorrect = revealed && selected === pair.right;
        return (
          <div key={pair.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-lg">
              <AutoFurigana text={pair.left} />
            </span>
            <select
              value={selected ?? ""}
              disabled={disabled}
              onChange={(e) => setSelection(pair.id, e.target.value)}
              className={cn(
                "flex-1 rounded-md border-2 bg-background px-3 py-2 text-base transition-colors",
                !revealed && selected && "border-primary",
                revealed &&
                  (isCorrect
                    ? "border-green-600"
                    : "animate-shake border-destructive"),
              )}
            >
              <option value="" disabled>
                Selecciona...
              </option>
              {rightOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      {revealed && (
        <p className="text-sm text-muted-foreground">
          {exercise.pairs.map((p) => `${p.left} = ${p.right}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
