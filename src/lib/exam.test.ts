import { describe, expect, it } from "vitest";
import {
  buildExam,
  exercisesInLessonRange,
  formatCountdown,
  formatDuration,
  getLessonRangeOptions,
  totalExamSeconds,
} from "./exam";
import type { Exercise } from "@/types/exercise";
import type { Lesson } from "@/types/content";

function makeLesson(
  id: string,
  order: number,
  exerciseIds: string[],
  kind: Lesson["kind"] = "lesson",
): Lesson {
  return {
    id,
    jlptLevel: "N5",
    order,
    title: `Lección ${order}`,
    kind,
    vocabIds: [],
    kanjiIds: [],
    grammarIds: [],
    exerciseIds,
  };
}

function makeExercise(
  id: string,
  skill: Exercise["skill"],
  type: Exercise["type"] = "multiple-choice",
): Exercise {
  if (type === "listening") {
    return {
      id,
      type: "listening",
      jlptLevel: "N5",
      skill,
      promptEs: "",
      targetJp: "本",
    };
  }
  return {
    id,
    type: "multiple-choice",
    jlptLevel: "N5",
    skill,
    promptEs: "",
    questionJp: "これは{{1}}です。",
    options: [
      { id: "a", textJp: "本", isCorrect: true },
      { id: "b", textJp: "猫", isCorrect: false },
    ],
  };
}

describe("buildExam", () => {
  it("groups exercises into vocab/kanji, grammar, and listening sections", () => {
    const exercises: Exercise[] = [
      makeExercise("v1", "vocabulary"),
      makeExercise("k1", "kanji"),
      makeExercise("g1", "grammar"),
      makeExercise("p1", "particles"),
      makeExercise("l1", "listening", "listening"),
    ];
    const sections = buildExam(exercises);
    const byId = new Map(sections.map((s) => [s.id, s]));

    expect(
      byId
        .get("vocab-kanji")
        ?.exercises.map((e) => e.id)
        .sort(),
    ).toEqual(["k1", "v1"]);
    expect(
      byId
        .get("grammar")
        ?.exercises.map((e) => e.id)
        .sort(),
    ).toEqual(["g1", "p1"]);
    expect(byId.get("listening")?.exercises.map((e) => e.id)).toEqual(["l1"]);
  });

  it("excludes speaking exercises entirely", () => {
    const sections = buildExam([makeExercise("s1", "speaking", "speaking")]);
    expect(sections).toEqual([]);
  });

  it("omits a section when the content level has none of its exercises yet", () => {
    const sections = buildExam([makeExercise("v1", "vocabulary")]);
    expect(sections.map((s) => s.id)).toEqual(["vocab-kanji"]);
  });

  it("caps each section at its configured max question count", () => {
    const manyVocab = Array.from({ length: 50 }, (_, i) =>
      makeExercise(`v${i}`, "vocabulary"),
    );
    const sections = buildExam(manyVocab);
    expect(sections[0].exercises.length).toBe(20);
  });

  it("gives each section a time budget proportional to its question count", () => {
    const exercises = Array.from({ length: 5 }, (_, i) =>
      makeExercise(`g${i}`, "grammar"),
    );
    const sections = buildExam(exercises);
    expect(sections[0].timeLimitSeconds).toBe(5 * 35);
  });
});

describe("totalExamSeconds", () => {
  it("sums the time limit across every section", () => {
    const sections = buildExam([
      makeExercise("v1", "vocabulary"),
      makeExercise("g1", "grammar"),
    ]);
    const expected = sections.reduce((sum, s) => sum + s.timeLimitSeconds, 0);
    expect(totalExamSeconds(sections)).toBe(expected);
  });
});

describe("formatDuration", () => {
  it("rounds to the nearest minute", () => {
    expect(formatDuration(90)).toBe("2 min");
    expect(formatDuration(600)).toBe("10 min");
  });

  it("calls out sub-minute durations instead of rounding to 0 min", () => {
    expect(formatDuration(30)).toBe("menos de 1 min");
  });
});

describe("formatCountdown", () => {
  it("formats seconds as m:ss", () => {
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(600)).toBe("10:00");
    expect(formatCountdown(5)).toBe("0:05");
  });
});

describe("getLessonRangeOptions", () => {
  it("returns only 'lesson' kind lessons, sorted by order", () => {
    const lessons = [
      makeLesson("l3", 3, []),
      makeLesson("l1", 1, []),
      makeLesson("review", 2, [], "review"),
    ];
    expect(getLessonRangeOptions(lessons).map((o) => o.id)).toEqual([
      "l1",
      "l3",
    ]);
  });
});

describe("exercisesInLessonRange", () => {
  const lessons = [
    makeLesson("l1", 1, ["e1", "e2"]),
    makeLesson("l2", 2, ["e3"]),
    makeLesson("l3", 3, ["e4"]),
  ];
  const exercises = [
    makeExercise("e1", "vocabulary"),
    makeExercise("e2", "vocabulary"),
    makeExercise("e3", "grammar"),
    makeExercise("e4", "grammar"),
  ];

  it("only includes exercises from lessons inside the order range", () => {
    const result = exercisesInLessonRange(exercises, lessons, 1, 2);
    expect(result.map((e) => e.id).sort()).toEqual(["e1", "e2", "e3"]);
  });

  it("includes every lesson's exercises when the range covers all of them", () => {
    const result = exercisesInLessonRange(exercises, lessons, 1, 3);
    expect(result).toHaveLength(4);
  });

  it("returns nothing for a range with no lessons in it", () => {
    const result = exercisesInLessonRange(exercises, lessons, 10, 20);
    expect(result).toEqual([]);
  });
});
