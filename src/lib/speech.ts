// Thin wrapper around the browser's Web Speech API (synthesis +
// recognition). Both are free and client-only — no API key, no backend —
// but support varies: speechSynthesis is near-universal, SpeechRecognition
// is Chromium-only (Chrome/Edge), so every entry point here is feature-
// detected and callers are expected to hide UI when unsupported rather than
// show a broken button.

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
}

export function createSpeechRecognition(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function getJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "ja-JP") ??
    voices.find((v) => v.lang.startsWith("ja"))
  );
}

/** Speaks Japanese text aloud. No-op if speechSynthesis isn't available. */
export function speakJapanese(text: string, rate = 0.9) {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate;
  const voice = getJapaneseVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

const JP_PUNCTUATION = /[。、！？!?.,、\s　「」『』・~〜]/g;

/** Strips punctuation/whitespace so STT output and content text compare fairly. */
export function normalizeSpeech(text: string): string {
  return text.replace(JP_PUNCTUATION, "").trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(cols).fill(0),
  );
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

/** 1 = identical, 0 = completely different, normalized by the longer string's length. */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Japanese speech recognition rarely returns an exact character match (it
 * may add punctuation, pick different-but-valid kanji, or mishear a
 * particle) even on correct pronunciation, so this grades on similarity
 * rather than strict equality.
 */
export function isPronunciationMatch(
  target: string,
  transcript: string,
  threshold = 0.75,
): boolean {
  const normTarget = normalizeSpeech(target);
  const normTranscript = normalizeSpeech(transcript);
  if (!normTranscript) return false;
  return (
    normTarget === normTranscript ||
    similarity(normTarget, normTranscript) >= threshold
  );
}
