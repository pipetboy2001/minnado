import { cache } from "react";
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
import n4Vocab from "./n4/vocabulary.json";
import n4Kanji from "./n4/kanji.json";
import n4Grammar from "./n4/grammar.json";
import n4Lessons from "./n4/lessons.json";
import n4Exercises from "./n4/exercises.json";

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

// Content files are static and re-validating the same JSON with Zod on
// every call is pure waste — exercises.json alone is 178KB/311 entries,
// and a single page can call these getters several times. cache() dedupes
// repeated calls within a request (and, since this content never changes,
// keeping a stale result around for the process lifetime outside of a
// request context — e.g. tests — is harmless too).
export const getVocabN5 = cache((): VocabWord[] =>
  parseContent(vocabFileSchema, n5Vocab, "n5/vocabulary.json"),
);

export const getKanjiN5 = cache((): KanjiEntry[] =>
  parseContent(kanjiFileSchema, n5Kanji, "n5/kanji.json"),
);

export const getKanjiN4 = cache((): KanjiEntry[] =>
  parseContent(kanjiFileSchema, n4Kanji, "n4/kanji.json"),
);

export const getGrammarN5 = cache((): GrammarRule[] =>
  parseContent(grammarFileSchema, n5Grammar, "n5/grammar.json"),
);

export const getLessonsN5 = cache((): Lesson[] =>
  parseContent(lessonFileSchema, n5Lessons, "n5/lessons.json"),
);

export const getExercisesN5 = cache((): Exercise[] =>
  parseContent(exerciseFileSchema, n5Exercises, "n5/exercises.json"),
);

export const getVocabN4 = cache((): VocabWord[] =>
  parseContent(vocabFileSchema, n4Vocab, "n4/vocabulary.json"),
);

export const getGrammarN4 = cache((): GrammarRule[] =>
  parseContent(grammarFileSchema, n4Grammar, "n4/grammar.json"),
);

export const getLessonsN4 = cache((): Lesson[] =>
  parseContent(lessonFileSchema, n4Lessons, "n4/lessons.json"),
);

export const getExercisesN4 = cache((): Exercise[] =>
  parseContent(exerciseFileSchema, n4Exercises, "n4/exercises.json"),
);
