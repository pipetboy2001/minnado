import type { ExerciseSkill, JlptLevel } from "./jlpt";

export type ExerciseType =
  "multiple-choice" | "fill-in-blank" | "word-order" | "matching";

export type ExerciseDifficulty = 1 | 2 | 3;

interface BaseExercise {
  id: string;
  type: ExerciseType;
  jlptLevel: JlptLevel;
  skill: ExerciseSkill;
  lessonId?: string;
  promptEs: string;
  explanationEs?: string;
  difficulty?: ExerciseDifficulty;
}

export interface MultipleChoiceOption {
  id: string;
  textJp: string;
  isCorrect: boolean;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: "multiple-choice";
  questionJp: string;
  questionReading?: string;
  options: MultipleChoiceOption[];
}

/**
 * sentenceTemplate uses numbered placeholders, e.g. "わたし{{1}}がくせい{{2}}。"
 * blanks[i].id must match the {{i}} placeholder number as a string.
 */
export interface FillInBlankBlank {
  id: string;
  acceptedAnswers: string[];
}

export interface FillInBlankExercise extends BaseExercise {
  type: "fill-in-blank";
  sentenceTemplate: string;
  sentenceReading?: string;
  translationEs?: string;
  blanks: FillInBlankBlank[];
}

export interface WordOrderExercise extends BaseExercise {
  type: "word-order";
  wordBank: string[];
  correctOrder: string[];
  translationEs: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingExercise extends BaseExercise {
  type: "matching";
  pairs: MatchingPair[];
}

export type Exercise =
  | MultipleChoiceExercise
  | FillInBlankExercise
  | WordOrderExercise
  | MatchingExercise;

export interface ExerciseAttemptResult {
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: unknown;
  attemptedAt: string;
}
