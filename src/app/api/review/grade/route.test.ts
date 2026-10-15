import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  vocab: { findUnique: vi.fn(), update: vi.fn() },
  kanji: { findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { vocabReviewCard: mocks.vocab, kanjiReviewCard: mocks.kanji },
}));

const { POST } = await import("./route");

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-01-01T00:00:00Z");

// A card the user has already gotten right twice (6-day interval).
const card = { id: "card-1", easeFactor: 2.5, intervalDays: 6, repetitions: 2 };

beforeEach(() => {
  vi.useFakeTimers({ now: NOW });
  mocks.auth.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  for (const model of [mocks.vocab, mocks.kanji]) {
    model.findUnique.mockReset().mockResolvedValue(card);
    model.update.mockReset().mockResolvedValue({});
  }
});

describe("POST /api/review/grade", () => {
  it("reschedules a vocab card with SM-2 and stamps lastReviewedAt", async () => {
    const response = await POST(
      jsonRequest("/api/review/grade", {
        type: "vocab",
        itemId: "n5-voc-0001",
        grade: "good",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.vocab.findUnique).toHaveBeenCalledWith({
      where: {
        userId_vocabWordId: { userId: "user-1", vocabWordId: "n5-voc-0001" },
      },
    });
    // Third success: interval = round(6 * 2.5) = 15 days.
    expect(mocks.vocab.update).toHaveBeenCalledWith({
      where: { id: "card-1" },
      data: {
        easeFactor: 2.5,
        intervalDays: 15,
        repetitions: 3,
        dueAt: new Date(NOW.getTime() + 15 * DAY_MS),
        lastReviewedAt: NOW,
      },
    });
    expect(mocks.kanji.update).not.toHaveBeenCalled();
  });

  it("resets a kanji card graded 'again'", async () => {
    await POST(
      jsonRequest("/api/review/grade", {
        type: "kanji",
        itemId: "n5-kan-0001",
        grade: "again",
      }),
    );

    expect(mocks.kanji.findUnique).toHaveBeenCalledWith({
      where: {
        userId_kanjiEntryId: { userId: "user-1", kanjiEntryId: "n5-kan-0001" },
      },
    });
    expect(mocks.kanji.update.mock.lastCall![0].data).toMatchObject({
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.3,
    });
    expect(mocks.vocab.update).not.toHaveBeenCalled();
  });

  it("returns 404 for a card the user doesn't have", async () => {
    mocks.vocab.findUnique.mockResolvedValue(null);
    const response = await POST(
      jsonRequest("/api/review/grade", {
        type: "vocab",
        itemId: "ajeno",
        grade: "good",
      }),
    );
    expect(response.status).toBe(404);
    expect(mocks.vocab.update).not.toHaveBeenCalled();
  });

  it("rejects anonymous requests", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(
      jsonRequest("/api/review/grade", {
        type: "vocab",
        itemId: "n5-voc-0001",
        grade: "good",
      }),
    );
    expect(response.status).toBe(401);
  });

  it.each([
    ["an unknown type", { type: "grammar", itemId: "x", grade: "good" }],
    ["an unknown grade", { type: "vocab", itemId: "x", grade: "hard" }],
    ["an empty itemId", { type: "vocab", itemId: "", grade: "good" }],
  ])("returns 400 for %s", async (_, body) => {
    const response = await POST(jsonRequest("/api/review/grade", body));
    expect(response.status).toBe(400);
    expect(mocks.vocab.findUnique).not.toHaveBeenCalled();
    expect(mocks.kanji.findUnique).not.toHaveBeenCalled();
  });
});
