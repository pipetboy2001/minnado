/**
 * Simplified SM-2 (the algorithm behind Anki/SuperMemo): each card tracks an
 * ease factor and interval, and every grade pushes the next review further
 * out — "again" resets progress, "good"/"easy" grow the interval so well-
 * known cards are reviewed less often.
 */

export type ReviewGrade = "again" | "good" | "easy";

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export const INITIAL_SRS_STATE: SrsState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

const MIN_EASE_FACTOR = 1.3;
const EASY_BONUS = 1.3;

export function scheduleNextReview(
  state: SrsState,
  grade: ReviewGrade,
): SrsState & { dueAt: Date } {
  let { easeFactor, intervalDays, repetitions } = state;

  if (grade === "again") {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }

    if (grade === "easy") {
      easeFactor += 0.15;
      intervalDays = Math.round(intervalDays * EASY_BONUS);
    }
  }

  const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  return { easeFactor, intervalDays, repetitions, dueAt };
}
