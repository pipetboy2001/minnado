"use client";

import { cn } from "@/lib/utils";
import type { MultipleChoiceExercise } from "@/types/exercise";
import type { MultipleChoiceAnswer } from "./grading";

export function MultipleChoiceQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: MultipleChoiceExercise;
  value?: MultipleChoiceAnswer;
  onChange: (answer: MultipleChoiceAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl">{exercise.questionJp}</p>
      {exercise.questionReading && (
        <p className="text-sm text-muted-foreground">
          {exercise.questionReading}
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {exercise.options.map((option) => {
          const isSelected = value?.selectedOptionId === option.id;
          const showAsCorrect = revealed && option.isCorrect;
          const showAsWrong = revealed && isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ selectedOptionId: option.id })}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-lg transition-colors",
                isSelected && !revealed && "border-primary bg-primary/10",
                !isSelected && !revealed && "border-border hover:bg-muted",
                showAsCorrect && "border-green-600 bg-green-600/10",
                showAsWrong && "border-destructive bg-destructive/10",
                revealed && !isSelected && !option.isCorrect && "opacity-60",
              )}
            >
              {option.textJp}
            </button>
          );
        })}
      </div>
    </div>
  );
}
