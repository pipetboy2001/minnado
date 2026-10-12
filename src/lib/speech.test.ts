import { describe, expect, it } from "vitest";
import { isPronunciationMatch, normalizeSpeech, similarity } from "./speech";

describe("normalizeSpeech", () => {
  it("strips Japanese and Latin punctuation", () => {
    expect(normalizeSpeech("私は学生です。")).toBe("私は学生です");
    expect(normalizeSpeech("これは「本」です！")).toBe("これは本です");
  });

  it("strips whitespace, including full-width spaces", () => {
    expect(normalizeSpeech("私は　学生 です")).toBe("私は学生です");
  });

  it("leaves kana/kanji content untouched", () => {
    expect(normalizeSpeech("水を飲みます")).toBe("水を飲みます");
  });
});

describe("similarity", () => {
  it("is 1 for identical strings", () => {
    expect(similarity("学生です", "学生です")).toBe(1);
  });

  it("is 0 for completely different strings of the same length", () => {
    expect(similarity("aaaa", "bbbb")).toBe(0);
  });

  it("is 1 for two empty strings", () => {
    expect(similarity("", "")).toBe(1);
  });

  it("decreases as strings diverge", () => {
    const closeMatch = similarity(
      "わたしはがくせいです",
      "わたしわがくせいです",
    );
    const farMatch = similarity("わたしはがくせいです", "こんにちは");
    expect(closeMatch).toBeGreaterThan(farMatch);
  });
});

describe("isPronunciationMatch", () => {
  it("accepts an exact match", () => {
    expect(isPronunciationMatch("私は学生です。", "私は学生です")).toBe(true);
  });

  it("accepts a one-character mishearing (は/わ homophone)", () => {
    // Real speech recognition often mistranscribes は as the phonetically
    // identical わ — this is the whole reason grading is similarity-based.
    expect(
      isPronunciationMatch("わたしはがくせいです", "わたしわがくせいです"),
    ).toBe(true);
  });

  it("rejects an empty transcript", () => {
    expect(isPronunciationMatch("私は学生です", "")).toBe(false);
  });

  it("rejects an unrelated transcript", () => {
    expect(isPronunciationMatch("私は学生です", "今日は晴れです")).toBe(false);
  });

  it("respects a custom threshold", () => {
    const target = "わたしはがくせいです";
    const transcript = "わたしがくせいです"; // missing one character
    expect(isPronunciationMatch(target, transcript, 0.99)).toBe(false);
    expect(isPronunciationMatch(target, transcript, 0.5)).toBe(true);
  });
});
