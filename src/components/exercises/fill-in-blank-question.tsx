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
          const isCorrect =
            revealed &&
            blank?.acceptedAnswers.some(
              (a) => a.trim() === (values[part.id] ?? "").trim(),
            );
          return (
            <Input
              key={i}
              value={values[part.id] ?? ""}
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
      {exercise.sentenceReading && (
        <p className="text-sm text-muted-foreground">
          {exercise.sentenceReading}
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
