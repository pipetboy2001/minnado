import { z } from "zod";

export const jlptLevelSchema = z.enum(["N5", "N4", "N3", "N2", "N1"]);
export const kanjiJlptLevelSchema = z.enum(["N5", "N4"]);

export const partOfSpeechSchema = z.enum([
  "noun",
  "pronoun",
  "verb-ru",
  "verb-u",
  "verb-irregular",
  "i-adjective",
  "na-adjective",
  "adverb",
  "particle",
  "conjunction",
  "counter",
  "expression",
]);

export const grammarCategorySchema = z.enum([
  "particles",
  "adjectives-i",
  "adjectives-na",
  "verb-forms",
  "sentence-structure",
  "conjugation",
  "questions",
  "numbers-counters",
]);

export const exerciseSkillSchema = z.enum([
  "vocabulary",
  "kanji",
  "grammar",
  "particles",
  "reading",
  "listening",
]);

export const vocabWordSchema = z.object({
  id: z.string(),
  jlptLevel: jlptLevelSchema,
  word: z.string().min(1),
  reading: z.string().min(1),
  romaji: z.string().min(1),
  meaningEs: z.string().min(1),
  meaningEn: z.string().optional(),
  partOfSpeech: partOfSpeechSchema,
  exampleSentenceJp: z.string().optional(),
  exampleSentenceReading: z.string().optional(),
  exampleSentenceEs: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const kanjiExampleWordSchema = z.object({
  word: z.string().min(1),
  reading: z.string().min(1),
  meaningEs: z.string().min(1),
});

export const kanjiEntrySchema = z.object({
  id: z.string(),
  character: z.string().length(1),
  jlptLevel: kanjiJlptLevelSchema,
  strokeCount: z.number().int().positive(),
  onyomi: z.array(z.string()),
  kunyomi: z.array(z.string()),
  meaningEs: z.string().min(1),
  meaningEn: z.string().optional(),
  radicals: z.array(z.string()).optional(),
  exampleWords: z.array(kanjiExampleWordSchema),
});

export const grammarExampleSchema = z.object({
  jp: z.string().min(1),
  reading: z.string().optional(),
  es: z.string().min(1),
});

export const grammarRuleSchema = z.object({
  id: z.string(),
  jlptLevel: jlptLevelSchema,
  category: grammarCategorySchema,
  title: z.string().min(1),
  pattern: z.string().min(1),
  explanationEs: z.string().min(1),
  structureNotes: z.string().optional(),
  examples: z.array(grammarExampleSchema).min(1),
  relatedGrammarIds: z.array(z.string()).optional(),
});

export const lessonSchema = z.object({
  id: z.string(),
  jlptLevel: jlptLevelSchema,
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().optional(),
  vocabIds: z.array(z.string()),
  kanjiIds: z.array(z.string()),
  grammarIds: z.array(z.string()),
  exerciseIds: z.array(z.string()),
});

const baseExerciseSchema = {
  id: z.string(),
  jlptLevel: jlptLevelSchema,
  skill: exerciseSkillSchema,
  lessonId: z.string().optional(),
  promptEs: z.string().min(1),
  explanationEs: z.string().optional(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
};

export const multipleChoiceExerciseSchema = z.object({
  ...baseExerciseSchema,
  type: z.literal("multiple-choice"),
  questionJp: z.string().min(1),
  questionReading: z.string().optional(),
  options: z
    .array(
      z.object({
        id: z.string(),
        textJp: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: "At least one option must be correct",
    }),
});

export const fillInBlankExerciseSchema = z.object({
  ...baseExerciseSchema,
  type: z.literal("fill-in-blank"),
  sentenceTemplate: z.string().min(1),
  sentenceReading: z.string().optional(),
  translationEs: z.string().optional(),
  blanks: z
    .array(
      z.object({
        id: z.string(),
        acceptedAnswers: z.array(z.string()).min(1),
      })
    )
    .min(1),
});

export const wordOrderExerciseSchema = z.object({
  ...baseExerciseSchema,
  type: z.literal("word-order"),
  wordBank: z.array(z.string()).min(2),
  correctOrder: z.array(z.string()).min(2),
  translationEs: z.string().min(1),
});

export const matchingExerciseSchema = z.object({
  ...baseExerciseSchema,
  type: z.literal("matching"),
  pairs: z
    .array(
      z.object({
        id: z.string(),
        left: z.string().min(1),
        right: z.string().min(1),
      })
    )
    .min(2),
});

export const exerciseSchema = z.discriminatedUnion("type", [
  multipleChoiceExerciseSchema,
  fillInBlankExerciseSchema,
  wordOrderExerciseSchema,
  matchingExerciseSchema,
]);

export const vocabFileSchema = z.array(vocabWordSchema);
export const kanjiFileSchema = z.array(kanjiEntrySchema);
export const grammarFileSchema = z.array(grammarRuleSchema);
export const lessonFileSchema = z.array(lessonSchema);
export const exerciseFileSchema = z.array(exerciseSchema);
