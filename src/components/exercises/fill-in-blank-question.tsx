"use client";

import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RubyText, AutoFurigana } from "@/components/furigana";
import { parseFuriganaBrackets } from "@/lib/furigana";
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
    <div className="flex flex-col gap-5">
      <p className="flex flex-wrap items-center gap-1.5 text-xl leading-loose font-jp">
        {parts.map((part, i) => {
          if (part.kind === "text") {
            return (
              <RubyText key={i} segments={parseFuriganaBrackets(part.value)} />
            );
          }

          const blank = exercise.blanks.find((b) => b.id === part.id);
          const currentValue = values[part.id] ?? "";
          const isCorrect = blank?.acceptedAnswers.some(
            (a) => a.trim() === currentValue.trim(),
          );
          const slotState = revealed
            ? isCorrect
              ? "correct"
              : "incorrect"
            : currentValue
              ? "filled"
              : "empty";

          return (
            <span
              key={i}
              className={cn(
                "inline-flex min-w-12 items-center justify-center rounded-md border-2 px-2 py-0.5 text-lg transition-all",
                slotState === "empty" &&
                  "border-dashed border-muted-foreground/40 text-muted-foreground",
                slotState === "filled" &&
                  "scale-105 border-primary bg-primary/10 font-medium shadow-sm",
                slotState === "correct" &&
                  "border-green-600 bg-green-600/10 font-medium",
                slotState === "incorrect" &&
                  "animate-shake border-destructive bg-destructive/10 font-medium",
              )}
            >
              {currentValue || " "}
            </span>
          );
        })}
      </p>

      {exercise.blanks.map((blank) => {
        if (!blank.options) {
          return (
            <Input
              key={blank.id}
              value={values[blank.id] ?? ""}
              onChange={(e) => setBlank(blank.id, e.target.value)}
              disabled={disabled}
              className="w-40"
            />
          );
        }

        return (
          <div key={blank.id} className="flex flex-wrap gap-2">
            {blank.options.map((option) => {
              const isSelected = values[blank.id] === option;
              const optionIsCorrect = blank.acceptedAnswers.includes(option);
              const showAsCorrect = revealed && optionIsCorrect;
              const showAsWrong = revealed && isSelected && !optionIsCorrect;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => setBlank(blank.id, option)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-lg transition-all",
                    isSelected &&
                      !revealed &&
                      "scale-[1.03] border-primary bg-primary/10 shadow-sm",
                    !isSelected && !revealed && "border-border hover:bg-muted",
                    showAsCorrect && "border-green-600 bg-green-600/10",
                    showAsWrong &&
                      "animate-shake border-destructive bg-destructive/10",
                    revealed && !isSelected && !optionIsCorrect && "opacity-60",
                  )}
                >
                  <AutoFurigana text={option} />
                  {showAsCorrect && <Check className="size-4 text-green-600" />}
                  {showAsWrong && <X className="size-4 text-destructive" />}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
