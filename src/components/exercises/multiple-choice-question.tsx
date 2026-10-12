"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Furigana, AutoFurigana } from "@/components/furigana";
import type { MultipleChoiceExercise } from "@/types/exercise";
import type { MultipleChoiceAnswer } from "./grading";
import { SentenceWithSlot, type SlotState } from "./sentence-with-slot";

const SLOT_PATTERN = /\{\{(\w+)\}\}/;

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
  const slotMatch = exercise.questionJp.match(SLOT_PATTERN);
  const selectedOption = exercise.options.find(
    (o) => o.id === value?.selectedOptionId,
  );

  let slotState: SlotState = "empty";
  if (revealed) {
    slotState = selectedOption?.isCorrect ? "correct" : "incorrect";
  } else if (selectedOption) {
    slotState = "filled";
  }

  return (
    <div className="flex flex-col gap-5">
      {slotMatch ? (
        <SentenceWithSlot
          text={exercise.questionJp}
          slotId={slotMatch[1]}
          slotValue={selectedOption?.textJp}
          slotState={slotState}
        />
      ) : (
        <Furigana text={exercise.questionJp} className="text-xl" />
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
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-lg transition-all",
                isSelected &&
                  !revealed &&
                  "scale-[1.02] border-primary bg-primary/10 shadow-md",
                !isSelected && !revealed && "border-border hover:bg-muted",
                showAsCorrect && "border-green-600 bg-green-600/10",
                showAsWrong &&
                  "animate-shake border-destructive bg-destructive/10",
                revealed && !isSelected && !option.isCorrect && "opacity-60",
              )}
            >
              <AutoFurigana text={option.textJp} />
              {showAsCorrect && <Check className="size-5 text-green-600" />}
              {showAsWrong && <X className="size-5 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
