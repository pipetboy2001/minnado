import { describe, expect, it } from "vitest";
import { parseFuriganaBrackets } from "@/lib/furigana";
import {
  getVocabN5,
  getKanjiN5,
  getKanjiN4,
  getGrammarN5,
  getLessonsN5,
  getExercisesN5,
} from "./loader";

describe("content loaders", () => {
  it("parse every N5/N4 content file against its Zod schema without throwing", () => {
    expect(() => getVocabN5()).not.toThrow();
    expect(() => getKanjiN5()).not.toThrow();
    expect(() => getKanjiN4()).not.toThrow();
    expect(() => getGrammarN5()).not.toThrow();
    expect(() => getLessonsN5()).not.toThrow();
    expect(() => getExercisesN5()).not.toThrow();
  });

  it("gives every id in every content file a unique id", () => {
    for (const items of [
      getVocabN5(),
      getKanjiN5(),
      getKanjiN4(),
      getGrammarN5(),
      getLessonsN5(),
      getExercisesN5(),
    ]) {
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references vocab/kanji/grammar/exercise ids that actually exist", () => {
    const vocabIds = new Set(getVocabN5().map((v) => v.id));
    const kanjiIds = new Set(
      [...getKanjiN5(), ...getKanjiN4()].map((k) => k.id),
    );
    const grammarIds = new Set(getGrammarN5().map((g) => g.id));
    const exerciseIds = new Set(getExercisesN5().map((e) => e.id));

    for (const lesson of getLessonsN5()) {
      for (const id of lesson.vocabIds) {
        expect(vocabIds.has(id), `lesson ${lesson.id} -> vocab ${id}`).toBe(
          true,
        );
      }
      for (const id of lesson.kanjiIds) {
        expect(kanjiIds.has(id), `lesson ${lesson.id} -> kanji ${id}`).toBe(
          true,
        );
      }
      for (const id of lesson.grammarIds) {
        expect(grammarIds.has(id), `lesson ${lesson.id} -> grammar ${id}`).toBe(
          true,
        );
      }
      for (const id of lesson.exerciseIds) {
        expect(
          exerciseIds.has(id),
          `lesson ${lesson.id} -> exercise ${id}`,
        ).toBe(true);
      }
    }
  });

  it("every exercise's lessonId (when set) points at a real lesson", () => {
    const lessonIds = new Set(getLessonsN5().map((l) => l.id));
    for (const exercise of getExercisesN5()) {
      if (exercise.lessonId) {
        expect(
          lessonIds.has(exercise.lessonId),
          `exercise ${exercise.id} -> lesson ${exercise.lessonId}`,
        ).toBe(true);
      }
    }
  });

  it("gives every multiple-choice exercise exactly one correct option", () => {
    for (const exercise of getExercisesN5()) {
      if (exercise.type !== "multiple-choice") continue;
      const correctCount = exercise.options.filter((o) => o.isCorrect).length;
      expect(correctCount, `exercise ${exercise.id}`).toBe(1);
    }
  });

  it("gives every fill-in-blank sentenceTemplate a blank entry for every {{n}} slot it declares", () => {
    for (const exercise of getExercisesN5()) {
      if (exercise.type !== "fill-in-blank") continue;
      const slotIds = [
        ...exercise.sentenceTemplate.matchAll(/\{\{(\w+)\}\}/g),
      ].map((m) => m[1]);
      const blankIds = exercise.blanks.map((b) => b.id);
      expect(new Set(slotIds), `exercise ${exercise.id}`).toEqual(
        new Set(blankIds),
      );
    }
  });

  it("keeps every furigana-bracket string in every content file in sync with its plain-text form", () => {
    // Regression guard for the furigana rendering bug: parseFuriganaBrackets
    // must rejoin to exactly the string with "[reading]" runs stripped, for
    // every Japanese string any content file actually ships.
    const strings: string[] = [];
    for (const w of getVocabN5()) {
      if (w.exampleSentenceJp) strings.push(w.exampleSentenceJp);
    }
    for (const k of [...getKanjiN5(), ...getKanjiN4()]) {
      for (const ex of k.exampleWords) strings.push(ex.word);
    }
    for (const g of getGrammarN5()) {
      for (const ex of g.examples) strings.push(ex.jp);
    }
    for (const e of getExercisesN5()) {
      if ("questionJp" in e) strings.push(e.questionJp);
      if ("sentenceTemplate" in e) strings.push(e.sentenceTemplate);
      if ("targetJp" in e) strings.push(e.targetJp);
    }

    for (const str of strings) {
      const rejoined = parseFuriganaBrackets(str)
        .map((s) => s.text)
        .join("");
      const strippedBrackets = str.replace(/\[[^\[\]]+\]/g, "");
      expect(rejoined, str).toBe(strippedBrackets);
    }
  });
});
