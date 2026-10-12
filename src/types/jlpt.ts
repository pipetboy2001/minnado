export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type PartOfSpeech =
  | "noun"
  | "pronoun"
  | "verb-ru"
  | "verb-u"
  | "verb-irregular"
  | "i-adjective"
  | "na-adjective"
  | "adverb"
  | "particle"
  | "conjunction"
  | "counter"
  | "expression";

export type GrammarCategory =
  | "particles"
  | "adjectives-i"
  | "adjectives-na"
  | "verb-forms"
  | "sentence-structure"
  | "conjugation"
  | "questions"
  | "numbers-counters";

export type ExerciseSkill =
  | "vocabulary"
  | "kanji"
  | "grammar"
  | "particles"
  | "reading"
  | "listening"
  | "speaking";
