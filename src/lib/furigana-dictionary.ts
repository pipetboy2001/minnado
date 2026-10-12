/**
 * Single-kanji reading fallbacks used ONLY for automatic furigana lookup
 * on short chips/options (word-order, matching, multiple-choice buttons).
 * This is deliberately separate from the curriculum's kanji.json: these
 * characters aren't necessarily "taught" yet, they just need a reading
 * hint when they show up as the stable kanji core of a conjugated word
 * (e.g. 飲む -> 飲み/飲んで still starts with 飲).
 */
export const EXTRA_KANJI_READINGS: Record<string, string> = {
  新: "あたら",
  大: "おお",
  元: "げん",
  行: "い",
  買: "か",
  読: "よ",
  書: "か",
  見: "み",
  来: "く",
  食: "た",
  飲: "の",
};
