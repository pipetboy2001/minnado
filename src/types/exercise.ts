import type { ExerciseSkill, JlptLevel } from "./jlpt";

export type ExerciseType =
  "multiple-choice" | "fill-in-blank" | "word-order" | "matching" | "speaking";

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
  /**
   * Japanese text. May contain a `{{1}}` slot placeholder (rendered as a
   * fill-in box in the sentence) and/or bracket-notation furigana, e.g.
   * "田中[たなか]さん{{1}}学生[がくせい]です。". Use bracket notation
   * ("漢字[かな]") for any kanji that needs a reading hint.
   */
  questionJp: string;
  options: MultipleChoiceOption[];
}

/**
 * sentenceTemplate uses numbered placeholders, e.g. "わたし{{1}}がくせい{{2}}。",
 * plus optional bracket-notation furigana, e.g. "大[おお]き{{1}}です。".
 * blanks[i].id must match the {{i}} placeholder number as a string.
 */
export interface FillInBlankBlank {
  id: string;
  acceptedAnswers: string[];
  /**
   * Optional multiple-choice options for this blank (correct answer +
   * distractors), rendered as buttons instead of a free-text input.
   * Typing Japanese without an IME is hard, so prefer this when possible.
   */
  options?: string[];
}

export interface FillInBlankExercise extends BaseExercise {
  type: "fill-in-blank";
  sentenceTemplate: string;
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

/**
 * Pronunciation exercise: the user speaks `targetJp` aloud and the browser's
 * speech recognition transcribes it for grading against that same text.
 * Requires SpeechRecognition support (Chrome/Edge) — hidden elsewhere when
 * unsupported.
 */
export interface SpeakingExercise extends BaseExercise {
  type: "speaking";
  targetJp: string;
  translationEs?: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | FillInBlankExercise
  | WordOrderExercise
  | MatchingExercise
  | SpeakingExercise;

export interface ExerciseAttemptResult {
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: unknown;
  attemptedAt: string;
}
