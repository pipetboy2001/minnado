"use client";

import {
  ArrowLeftRight,
  Headphones,
  ListChecks,
  Mic,
  PenLine,
  Shuffle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Exercise, ExerciseType } from "@/types/exercise";
import type { ExerciseAnswer } from "./grading";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { FillInBlankQuestion } from "./fill-in-blank-question";
import { WordOrderQuestion } from "./word-order-question";
import { MatchingQuestion } from "./matching-question";
import { SpeakingQuestion } from "./speaking-question";
import { ListeningQuestion } from "./listening-question";

export const EXERCISE_TYPE_META: Record<
  ExerciseType,
  { icon: LucideIcon; label: string }
> = {
  "multiple-choice": { icon: ListChecks, label: "Opción múltiple" },
  "fill-in-blank": { icon: PenLine, label: "Completar espacio" },
  "word-order": { icon: ArrowLeftRight, label: "Ordenar palabras" },
  matching: { icon: Shuffle, label: "Emparejar" },
  speaking: { icon: Mic, label: "Pronunciación" },
  listening: { icon: Headphones, label: "Comprensión auditiva" },
};

/** Renders the right question component for `exercise.type`. Shared by the
 * per-lesson player and exam mode so both stay in sync automatically when a
 * new exercise type is added. */
export function ExerciseQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: Exercise;
  value: ExerciseAnswer | undefined;
  onChange: (answer: ExerciseAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  switch (exercise.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestion
          key={exercise.id}
          exercise={exercise}
          value={value as never}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
    case "fill-in-blank":
      return (
        <FillInBlankQuestion
          key={exercise.id}
          exercise={exercise}
          value={value as never}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
    case "word-order":
      return (
        <WordOrderQuestion
          key={exercise.id}
          exercise={exercise}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
    case "matching":
      return (
        <MatchingQuestion
          key={exercise.id}
          exercise={exercise}
          value={value as never}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
    case "speaking":
      return (
        <SpeakingQuestion
          key={exercise.id}
          exercise={exercise}
          value={value as never}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
    case "listening":
      return (
        <ListeningQuestion
          key={exercise.id}
          exercise={exercise}
          value={value as never}
          onChange={onChange}
          revealed={revealed}
          disabled={disabled}
        />
      );
  }
}
