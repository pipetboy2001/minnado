import { describe, expect, it } from "vitest";
import { INITIAL_SRS_STATE, scheduleNextReview, type SrsState } from "./srs";

function daysFromNow(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

describe("scheduleNextReview", () => {
  it("schedules a brand-new card for tomorrow on a 'good' grade", () => {
    const next = scheduleNextReview(INITIAL_SRS_STATE, "good");
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.easeFactor).toBe(2.5);
    expect(daysFromNow(next.dueAt)).toBe(1);
  });

  it("uses the classic 1 then 6 day steps for the first two successes", () => {
    const first = scheduleNextReview(INITIAL_SRS_STATE, "good");
    const second = scheduleNextReview(first, "good");
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it("grows the interval by the ease factor after the third success", () => {
    const first = scheduleNextReview(INITIAL_SRS_STATE, "good");
    const second = scheduleNextReview(first, "good");
    const third = scheduleNextReview(second, "good");
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(Math.round(6 * second.easeFactor));
  });

  it("resets repetitions and interval to 1 day on 'again'", () => {
    const studied: SrsState = {
      easeFactor: 2.5,
      intervalDays: 30,
      repetitions: 5,
    };
    const next = scheduleNextReview(studied, "again");
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
  });

  it("lowers the ease factor on 'again', floored at 1.3", () => {
    const next = scheduleNextReview(INITIAL_SRS_STATE, "again");
    expect(next.easeFactor).toBeCloseTo(2.3);

    const alreadyLow: SrsState = {
      easeFactor: 1.35,
      intervalDays: 10,
      repetitions: 3,
    };
    const flooredNext = scheduleNextReview(alreadyLow, "again");
    expect(flooredNext.easeFactor).toBe(1.3);
  });

  it("raises the ease factor and applies a bonus on 'easy'", () => {
    const next = scheduleNextReview(INITIAL_SRS_STATE, "easy");
    expect(next.easeFactor).toBeCloseTo(2.65);
    // First success is normally 1 day; "easy" multiplies it by 1.3.
    expect(next.intervalDays).toBe(Math.round(1 * 1.3));
  });

  it("never lets 'again' reduce the interval below 1 day", () => {
    const next = scheduleNextReview(INITIAL_SRS_STATE, "again");
    expect(next.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
