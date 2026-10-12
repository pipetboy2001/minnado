import { getVocabN5, getKanjiN5, getKanjiN4 } from "@/content/loader";
import { EXTRA_KANJI_READINGS } from "./furigana-dictionary";

export interface FuriganaSegment {
  text: string;
  reading?: string;
}

const BRACKET_PATTERN = /([^\[\]]+)\[([^\[\]]+)\]/g;

/**
 * Parses bracket-notation furigana, e.g. "大き[おおき]い" into
 * [{ text: "大き", reading: "おおき" }, { text: "い" }].
 * Text outside brackets is emitted as plain segments.
 */
export function parseFuriganaBrackets(text: string): FuriganaSegment[] {
  const segments: FuriganaSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BRACKET_PATTERN)) {
    const [full, base, reading] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index) });
    }
    segments.push({ text: base, reading });
    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

/** Strips bracket-notation furigana down to the base text, e.g. "大き[おおき]い" → "大きい". */
export function stripFuriganaBrackets(text: string): string {
  return parseFuriganaBrackets(text)
    .map((segment) => segment.text)
    .join("");
}

let cachedDictionary: Map<string, string> | null = null;
let cachedKeysByLengthDesc: string[] | null = null;

function getDictionary() {
  if (cachedDictionary) {
    return { dictionary: cachedDictionary, keys: cachedKeysByLengthDesc! };
  }

  const dictionary = new Map<string, string>();
  for (const word of getVocabN5()) {
    if (!dictionary.has(word.word)) {
      dictionary.set(word.word, word.reading);
    }
  }
  for (const kanji of [...getKanjiN5(), ...getKanjiN4()]) {
    if (!dictionary.has(kanji.character)) {
      dictionary.set(
        kanji.character,
        kanji.kunyomi[0] ?? kanji.onyomi[0] ?? "",
      );
    }
  }
  for (const [character, reading] of Object.entries(EXTRA_KANJI_READINGS)) {
    if (!dictionary.has(character)) {
      dictionary.set(character, reading);
    }
  }

  cachedDictionary = dictionary;
  cachedKeysByLengthDesc = [...dictionary.keys()].sort(
    (a, b) => b.length - a.length,
  );
  return { dictionary, keys: cachedKeysByLengthDesc };
}

const KANJI_PATTERN = /[一-鿿]/;

/**
 * Greedily tokenizes a short string (a vocab word, chip, or option
 * button) against the content's own vocabulary/kanji dictionary, so
 * kanji get an automatic reading without needing bracket notation.
 * Non-kanji runs (particles, okurigana, conjugation endings) are left
 * as plain text since they're already readable kana.
 */
export function autoFurigana(text: string): FuriganaSegment[] {
  const { dictionary, keys } = getDictionary();
  const segments: FuriganaSegment[] = [];
  let i = 0;

  while (i < text.length) {
    if (!KANJI_PATTERN.test(text[i])) {
      let j = i + 1;
      while (j < text.length && !KANJI_PATTERN.test(text[j])) j++;
      segments.push({ text: text.slice(i, j) });
      i = j;
      continue;
    }

    const match = keys.find((key) => text.startsWith(key, i));
    if (match) {
      segments.push({ text: match, reading: dictionary.get(match) });
      i += match.length;
    } else {
      segments.push({ text: text[i] });
      i += 1;
    }
  }

  return segments;
}
