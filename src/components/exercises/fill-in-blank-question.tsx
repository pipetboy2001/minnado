"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FillInBlankExercise } from "@/types/exercise";
import type { FillInBlankAnswer } from "./grading";

function splitTemplate(template: string) {
  return template
    .split(/\{\{(\w+)\}\}/)
    .map((part, index) =>
      index % 2 === 0
        ? { kind: "text" as const, value: part }
        : { kind: "blank" as const, id: part },
    );
}

export function FillInBlankQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: FillInBlankExercise;
  value?: FillInBlankAnswer;
  onChange: (answer: FillInBlankAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  const parts = splitTemplate(exercise.sentenceTemplate);
  const readingParts = exercise.sentenceReading
    ? splitTemplate(exercise.sentenceReading)
    : null;
  const values = value?.values ?? {};

  function setBlank(id: string, text: string) {
    onChange({ values: { ...values, [id]: text } });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex flex-wrap items-center gap-1 text-xl leading-loose">
        {parts.map((part, i) => {
          if (part.kind === "text") {
            return <span key={i}>{part.value}</span>;
          }
          const blank = exercise.blanks.find((b) => b.id === part.id);
          const currentValue = values[part.id] ?? "";
          const isCorrect =
            revealed &&
            blank?.acceptedAnswers.some(
              (a) => a.trim() === currentValue.trim(),
            );

          if (blank?.options) {
            return (
              <span key={i} className="inline-flex flex-wrap gap-1.5">
                {blank.options.map((option) => {
                  const isSelected = currentValue === option;
                  const optionIsCorrect =
                    blank.acceptedAnswers.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={disabled}
                      onClick={() => setBlank(part.id, option)}
                      className={cn(
                        "rounded-md border px-3 py-1 text-lg transition-colors",
                        isSelected &&
                          !revealed &&
                          "border-primary bg-primary/10",
                        !isSelected &&
                          !revealed &&
                          "border-border hover:bg-muted",
                        revealed &&
                          optionIsCorrect &&
                          "border-green-600 bg-green-600/10",
                        revealed &&
                          isSelected &&
                          !optionIsCorrect &&
                          "border-destructive bg-destructive/10",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </span>
            );
          }

          return (
            <Input
              key={i}
              value={currentValue}
              onChange={(e) => setBlank(part.id, e.target.value)}
              disabled={disabled}
              className={cn(
                "inline-block h-9 w-28 text-center text-lg",
                revealed &&
                  (isCorrect ? "border-green-600" : "border-destructive"),
              )}
            />
          );
        })}
      </p>
      {revealed && readingParts && (
        <p className="text-sm text-muted-foreground">
          {readingParts.map((part, i) =>
            part.kind === "text"
              ? part.value
              : exercise.blanks.find((b) => b.id === part.id)
                  ?.acceptedAnswers[0],
          )}
        </p>
      )}
      {revealed && (
        <p className="text-sm text-muted-foreground">
          Respuesta correcta:{" "}
          {exercise.blanks.map((b) => b.acceptedAnswers[0]).join(" / ")}
        </p>
      )}
    </div>
  );
}
