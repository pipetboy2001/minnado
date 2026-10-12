import type { ZodSchema } from "zod";
import type {
  VocabWord,
  KanjiEntry,
  GrammarRule,
  Lesson,
} from "@/types/content";
import type { Exercise } from "@/types/exercise";
import {
  vocabFileSchema,
  kanjiFileSchema,
  grammarFileSchema,
  lessonFileSchema,
  exerciseFileSchema,
} from "./schema";

import n5Vocab from "./n5/vocabulary.json";
import n5Kanji from "./n5/kanji.json";
import n5Grammar from "./n5/grammar.json";
import n5Lessons from "./n5/lessons.json";
import n5Exercises from "./n5/exercises.json";
import n4Kanji from "./n4/kanji.json";

function parseContent<T>(
  schema: ZodSchema<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid content file "${label}": ${result.error.issues
        .map((i) => `${i.path.join(".")} — ${i.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
}

export function getVocabN5(): VocabWord[] {
  return parseContent(vocabFileSchema, n5Vocab, "n5/vocabulary.json");
}

export function getKanjiN5(): KanjiEntry[] {
  return parseContent(kanjiFileSchema, n5Kanji, "n5/kanji.json");
}

export function getKanjiN4(): KanjiEntry[] {
  return parseContent(kanjiFileSchema, n4Kanji, "n4/kanji.json");
}

export function getGrammarN5(): GrammarRule[] {
  return parseContent(grammarFileSchema, n5Grammar, "n5/grammar.json");
}

export function getLessonsN5(): Lesson[] {
  return parseContent(lessonFileSchema, n5Lessons, "n5/lessons.json");
}

export function getExercisesN5(): Exercise[] {
  return parseContent(exerciseFileSchema, n5Exercises, "n5/exercises.json");
}
