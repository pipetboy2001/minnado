import { cache } from "react";
import type { ZodSchema } from "zod";
import type {
  VocabWord,
  KanjiEntry,
  GrammarRule,
  Lesson,
} from "@/types/content";
import type { Exercise } from "@/types/exercise";
import type { JlptLevel } from "@/types/jlpt";
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

// Every level the content pipeline currently has JSON for. Adding N3/N2
// later is: new n3/*.json files, getXN3() getters above, and one new
// entry here — every getAll*() below and the level toggle in LessonTabs
// (which reads jlptLevel off the returned lessons) pick it up for free.
type AvailableLevel = Extract<JlptLevel, "N5" | "N4">;

const LEVELS: Record<
  AvailableLevel,
  {
    lessons: () => Lesson[];
    vocab: () => VocabWord[];
    kanji: () => KanjiEntry[];
    grammar: () => GrammarRule[];
    exercises: () => Exercise[];
  }
> = {
  N5: {
    lessons: getLessonsN5,
    vocab: getVocabN5,
    kanji: getKanjiN5,
    grammar: getGrammarN5,
    exercises: getExercisesN5,
  },
  N4: {
    lessons: getLessonsN4,
    vocab: getVocabN4,
    kanji: getKanjiN4,
    grammar: getGrammarN4,
    exercises: getExercisesN4,
  },
};

/** The getters for one level, e.g. to load only the content a given lesson needs. */
export function getLevelContent(level: JlptLevel) {
  const content = LEVELS[level as AvailableLevel];
  if (!content) {
    throw new Error(`No content pipeline for JLPT level "${level}" yet`);
  }
  return content;
}

export const getAllLessons = cache((): Lesson[] =>
  Object.values(LEVELS).flatMap((l) => l.lessons()),
);

export const getAllVocab = cache((): VocabWord[] =>
  Object.values(LEVELS).flatMap((l) => l.vocab()),
);

export const getAllKanji = cache((): KanjiEntry[] =>
  Object.values(LEVELS).flatMap((l) => l.kanji()),
);

export const getAllGrammar = cache((): GrammarRule[] =>
  Object.values(LEVELS).flatMap((l) => l.grammar()),
);

export const getAllExercises = cache((): Exercise[] =>
  Object.values(LEVELS).flatMap((l) => l.exercises()),
);
