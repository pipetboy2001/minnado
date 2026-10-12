import { describe, expect, it } from "vitest";
import {
  autoFurigana,
  parseFuriganaBrackets,
  stripFuriganaBrackets,
} from "./furigana";

describe("parseFuriganaBrackets", () => {
  it("splits bracket-notation furigana into base/reading segments", () => {
    expect(parseFuriganaBrackets("大き[おおき]い")).toEqual([
      { text: "大き", reading: "おおき" },
      { text: "い" },
    ]);
  });

  it("returns a single plain segment when there's no bracket notation", () => {
    expect(parseFuriganaBrackets("がくせい")).toEqual([{ text: "がくせい" }]);
  });

  it("handles multiple bracketed runs in one string", () => {
    expect(parseFuriganaBrackets("私[わたし]は学生[がくせい]です。")).toEqual([
      { text: "私", reading: "わたし" },
      { text: "は" },
      { text: "学生", reading: "がくせい" },
      { text: "です。" },
    ]);
  });

  it("doesn't attach a reading to plain text sitting before the next bracket", () => {
    // Regression: a greedy base capture used to swallow "は　大" (the
    // particle, a space, and the next kanji) as if おお were its reading,
    // instead of applying it to 大 alone. Real content hits this (lesson
    // 1's fill-in-blank: "この　家[いえ]は　大[おお]き").
    expect(parseFuriganaBrackets("この　家[いえ]は　大[おお]き")).toEqual([
      { text: "この　" },
      { text: "家", reading: "いえ" },
      { text: "は　" },
      { text: "大", reading: "おお" },
      { text: "き" },
    ]);
  });

  it("includes trailing okurigana in the base only when authored inside the brackets", () => {
    expect(parseFuriganaBrackets("大き[おおき]い")).toEqual([
      { text: "大き", reading: "おおき" },
      { text: "い" },
    ]);
  });
});

describe("stripFuriganaBrackets", () => {
  it("removes the bracket notation, keeping only the base text", () => {
    expect(stripFuriganaBrackets("大き[おおき]い")).toBe("大きい");
    expect(stripFuriganaBrackets("私[わたし]は学生[がくせい]です。")).toBe(
      "私は学生です。",
    );
  });

  it("is a no-op on text without brackets", () => {
    expect(stripFuriganaBrackets("これは本です。")).toBe("これは本です。");
  });
});

describe("autoFurigana", () => {
  it("looks up known vocabulary words from the content dictionary", () => {
    // n5-voc-0001 in the seed content is 私 (わたし).
    const segments = autoFurigana("私");
    expect(segments).toEqual([{ text: "私", reading: "わたし" }]);
  });

  it("leaves non-kanji runs (kana, particles) as plain text", () => {
    const segments = autoFurigana("がくせい");
    expect(segments).toEqual([{ text: "がくせい" }]);
  });

  it("leaves an unknown kanji without a reading instead of guessing", () => {
    // 鬱 isn't in any N5/N4 content list used by this project.
    const segments = autoFurigana("鬱");
    expect(segments).toEqual([{ text: "鬱" }]);
  });
});
