import { describe, expect, it } from "vitest";
import { gradeExercise } from "./grading";
import type {
  MultipleChoiceExercise,
  FillInBlankExercise,
  WordOrderExercise,
  MatchingExercise,
  SpeakingExercise,
  ListeningExercise,
} from "@/types/exercise";

describe("gradeExercise: multiple-choice", () => {
  const exercise: MultipleChoiceExercise = {
    id: "ex-1",
    type: "multiple-choice",
    jlptLevel: "N5",
    skill: "particles",
    promptEs: "Elige la partícula correcta.",
    questionJp: "わたし{{1}}がくせいです。",
    options: [
      { id: "a", textJp: "は", isCorrect: true },
      { id: "b", textJp: "を", isCorrect: false },
    ],
  };

  it("is correct when the selected option is marked correct", () => {
    expect(gradeExercise(exercise, { selectedOptionId: "a" })).toBe(true);
  });

  it("is incorrect when the selected option is wrong", () => {
    expect(gradeExercise(exercise, { selectedOptionId: "b" })).toBe(false);
  });

  it("is incorrect when the option id doesn't exist", () => {
    expect(gradeExercise(exercise, { selectedOptionId: "nope" })).toBe(false);
  });
});

describe("gradeExercise: fill-in-blank", () => {
  const exercise: FillInBlankExercise = {
    id: "ex-2",
    type: "fill-in-blank",
    jlptLevel: "N5",
    skill: "grammar",
    promptEs: "Completa la oración.",
    sentenceTemplate: "この家は大き{{1}}です。",
    blanks: [{ id: "1", acceptedAnswers: ["くない", "くないです"] }],
  };

  it("accepts any of the accepted answers, trimmed", () => {
    expect(gradeExercise(exercise, { values: { "1": "くない" } })).toBe(true);
    expect(gradeExercise(exercise, { values: { "1": "  くない  " } })).toBe(
      true,
    );
  });

  it("rejects a wrong answer", () => {
    expect(gradeExercise(exercise, { values: { "1": "い" } })).toBe(false);
  });

  it("rejects when a blank is missing", () => {
    expect(gradeExercise(exercise, { values: {} })).toBe(false);
  });

  it("requires every blank to be correct", () => {
    const multiBlank: FillInBlankExercise = {
      ...exercise,
      blanks: [
        { id: "1", acceptedAnswers: ["くない"] },
        { id: "2", acceptedAnswers: ["です"] },
      ],
    };
    expect(
      gradeExercise(multiBlank, { values: { "1": "くない", "2": "です" } }),
    ).toBe(true);
    expect(
      gradeExercise(multiBlank, { values: { "1": "くない", "2": "だ" } }),
    ).toBe(false);
  });
});

describe("gradeExercise: word-order", () => {
  const exercise: WordOrderExercise = {
    id: "ex-3",
    type: "word-order",
    jlptLevel: "N5",
    skill: "grammar",
    promptEs: "Ordena las palabras.",
    wordBank: ["水", "を", "飲みます", "私は"],
    correctOrder: ["私は", "水", "を", "飲みます"],
    translationEs: "Yo bebo agua.",
  };

  it("is correct only in the exact order", () => {
    expect(
      gradeExercise(exercise, {
        order: ["私は", "水", "を", "飲みます"],
      }),
    ).toBe(true);
  });

  it("is incorrect when the order differs", () => {
    expect(
      gradeExercise(exercise, {
        order: ["水", "私は", "を", "飲みます"],
      }),
    ).toBe(false);
  });

  it("is incorrect when a word is missing", () => {
    expect(gradeExercise(exercise, { order: ["私は", "水", "を"] })).toBe(
      false,
    );
  });
});

describe("gradeExercise: matching", () => {
  const exercise: MatchingExercise = {
    id: "ex-4",
    type: "matching",
    jlptLevel: "N5",
    skill: "vocabulary",
    promptEs: "Une cada palabra con su significado.",
    pairs: [
      { id: "p1", left: "学生", right: "estudiante" },
      { id: "p2", left: "元気", right: "con energía" },
    ],
  };

  it("is correct when every pair is matched", () => {
    expect(
      gradeExercise(exercise, {
        selections: { p1: "estudiante", p2: "con energía" },
      }),
    ).toBe(true);
  });

  it("is incorrect when any pair is wrong", () => {
    expect(
      gradeExercise(exercise, {
        selections: { p1: "con energía", p2: "estudiante" },
      }),
    ).toBe(false);
  });
});

describe("gradeExercise: speaking", () => {
  const exercise: SpeakingExercise = {
    id: "ex-5",
    type: "speaking",
    jlptLevel: "N5",
    skill: "speaking",
    promptEs: "Pronuncia la oración.",
    targetJp: "私[わたし]は学生[がくせい]です。",
  };

  it("accepts an exact transcript (furigana brackets stripped)", () => {
    expect(gradeExercise(exercise, { transcript: "私は学生です。" })).toBe(
      true,
    );
  });

  it("accepts a close-enough transcript", () => {
    expect(gradeExercise(exercise, { transcript: "私は学生です" })).toBe(true);
  });

  it("rejects an empty or unrelated transcript", () => {
    expect(gradeExercise(exercise, { transcript: "" })).toBe(false);
    expect(gradeExercise(exercise, { transcript: "今日は晴れです。" })).toBe(
      false,
    );
  });
});

describe("gradeExercise: listening", () => {
  const exercise: ListeningExercise = {
    id: "ex-6",
    type: "listening",
    jlptLevel: "N5",
    skill: "listening",
    promptEs: "Escucha y escribe.",
    targetJp: "水[みず]を飲[の]みます。",
    targetReading: "みずをのみます。",
  };

  it("accepts the kanji form", () => {
    expect(gradeExercise(exercise, { text: "水を飲みます。" })).toBe(true);
  });

  it("accepts the kana-only reading, so kanji choice isn't required", () => {
    expect(gradeExercise(exercise, { text: "みずをのみます" })).toBe(true);
  });

  it("requires an exact (normalized) match, unlike speaking", () => {
    expect(gradeExercise(exercise, { text: "水飲みます" })).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(gradeExercise(exercise, { text: "" })).toBe(false);
  });
});
