import { beforeEach, describe, expect, it, vi } from "vitest";
import { getExerciseById } from "@/content/loader";

const authMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/auth", () => ({ auth: () => authMock() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userExerciseAttempt: {
      create: (args: unknown) => createMock(args),
    },
  },
}));

const { POST } = await import("./route");

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

/** The isCorrect value that was persisted by the last request. */
function storedIsCorrect() {
  return createMock.mock.lastCall?.[0].data.isCorrect;
}

beforeEach(() => {
  authMock.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  createMock.mockReset().mockResolvedValue({ id: "attempt-1" });
});

describe("POST /api/attempts", () => {
  it("rejects anonymous requests", async () => {
    authMock.mockResolvedValue(null);
    const response = await post({ exerciseId: "n5-ex-0001", userAnswer: {} });
    expect(response.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("grades on the server and ignores an isCorrect sent by the client", async () => {
    // n5-ex-0001: わたし{{1}}がくせいです。 — the correct option is "a" (は).
    const response = await post({
      exerciseId: "n5-ex-0001",
      isCorrect: true,
      userAnswer: { selectedOptionId: "b" },
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ isCorrect: false });
    expect(storedIsCorrect()).toBe(false);
  });

  it("stores a correct answer as correct", async () => {
    const response = await post({
      exerciseId: "n5-ex-0001",
      isCorrect: false,
      userAnswer: { selectedOptionId: "a" },
    });

    expect(response.status).toBe(201);
    expect(storedIsCorrect()).toBe(true);
  });

  it("returns 404 for an exercise that doesn't exist", async () => {
    const response = await post({
      exerciseId: "no-existe",
      userAnswer: { selectedOptionId: "a" },
    });
    expect(response.status).toBe(404);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the answer doesn't match the exercise type", async () => {
    // A word-order answer sent for a multiple-choice exercise.
    const response = await post({
      exerciseId: "n5-ex-0001",
      userAnswer: { order: ["は"] },
    });
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it.each([
    ["fill-in-blank", "n5-ex-0002", { values: { "1": "くない" } }],
    ["word-order", "n5-ex-0003", { order: ["私は", "水", "を", "飲みます"] }],
    ["speaking", "n5-ex-0030", { transcript: "私は学生です" }],
    ["listening", "n5-ex-0033", { text: "みずをのみます" }],
  ])("grades %s exercises on the server", async (_type, id, answer) => {
    const response = await post({ exerciseId: id, userAnswer: answer });
    expect(response.status).toBe(201);
    expect(storedIsCorrect()).toBe(true);
  });

  it("grades matching exercises on the server", async () => {
    const exercise = getExerciseById("n5-ex-0004");
    if (exercise?.type !== "matching") throw new Error("fixture changed");
    const selections = Object.fromEntries(
      exercise.pairs.map((pair) => [pair.id, pair.right]),
    );

    const response = await post({
      exerciseId: "n5-ex-0004",
      userAnswer: { selections },
    });
    expect(response.status).toBe(201);
    expect(storedIsCorrect()).toBe(true);
  });
});
