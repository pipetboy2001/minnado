import { z } from "zod";
import { stripFuriganaBrackets } from "@/lib/furigana";
import { isPronunciationMatch, normalizeSpeech } from "@/lib/speech";
import type { Exercise } from "@/types/exercise";

export type MultipleChoiceAnswer = { selectedOptionId: string };
export type FillInBlankAnswer = { values: Record<string, string> };
export type WordOrderAnswer = { order: string[] };
export type MatchingAnswer = { selections: Record<string, string> };
export type SpeakingAnswer = { transcript: string };
export type ListeningAnswer = { text: string };

export type ExerciseAnswer =
  | MultipleChoiceAnswer
  | FillInBlankAnswer
  | WordOrderAnswer
  | MatchingAnswer
  | SpeakingAnswer
  | ListeningAnswer;

const answerSchemas = {
  "multiple-choice": z.object({ selectedOptionId: z.string() }),
  "fill-in-blank": z.object({ values: z.record(z.string(), z.string()) }),
  "word-order": z.object({ order: z.array(z.string()) }),
  matching: z.object({ selections: z.record(z.string(), z.string()) }),
  speaking: z.object({ transcript: z.string() }),
  listening: z.object({ text: z.string() }),
} satisfies Record<Exercise["type"], z.ZodType>;

/**
 * Validates an untrusted answer (e.g. a request body) against the shape
 * `gradeExercise` expects for this exercise's type. Returns null if it
 * doesn't match.
 */
export function parseAnswer(
  exercise: Exercise,
  raw: unknown,
): ExerciseAnswer | null {
  const result = answerSchemas[exercise.type].safeParse(raw);
  return result.success ? result.data : null;
}

function normalize(value: string) {
  return value.trim();
}

export function gradeExercise(
  exercise: Exercise,
  answer: ExerciseAnswer,
): boolean {
  switch (exercise.type) {
    case "multiple-choice": {
      const { selectedOptionId } = answer as MultipleChoiceAnswer;
      return (
        exercise.options.find((o) => o.id === selectedOptionId)?.isCorrect ??
        false
      );
    }
    case "fill-in-blank": {
      const { values } = answer as FillInBlankAnswer;
      return exercise.blanks.every((blank) =>
        blank.acceptedAnswers.some(
          (accepted) =>
            normalize(accepted) === normalize(values[blank.id] ?? ""),
        ),
      );
    }
    case "word-order": {
      const { order } = answer as WordOrderAnswer;
      return (
        order.length === exercise.correctOrder.length &&
        order.every((word, i) => word === exercise.correctOrder[i])
      );
    }
    case "matching": {
      const { selections } = answer as MatchingAnswer;
      return exercise.pairs.every((pair) => selections[pair.id] === pair.right);
    }
    case "speaking": {
      const { transcript } = answer as SpeakingAnswer;
      return isPronunciationMatch(
        stripFuriganaBrackets(exercise.targetJp),
        transcript,
      );
    }
    case "listening": {
      const { text } = answer as ListeningAnswer;
      const normalizedInput = normalizeSpeech(text);
      if (!normalizedInput) return false;
      const acceptedForms = [
        stripFuriganaBrackets(exercise.targetJp),
        exercise.targetReading,
      ].filter((form): form is string => !!form);
      return acceptedForms.some(
        (form) => normalizedInput === normalizeSpeech(form),
      );
    }
  }
}
