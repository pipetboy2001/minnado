import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn() }));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { practiceSession: { create: mocks.create } },
}));

const { POST } = await import("./route");

const validBody = { lessonId: "n5-lesson-01", score: 9, totalExercises: 12 };

beforeEach(() => {
  mocks.auth.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  mocks.create.mockReset().mockResolvedValue({ id: "session-1" });
});

describe("POST /api/sessions", () => {
  it("saves the practice session for the signed-in user", async () => {
    const response = await POST(jsonRequest("/api/sessions", validBody));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ session: { id: "session-1" } });
    expect(mocks.create.mock.lastCall![0].data).toEqual({
      userId: "user-1",
      ...validBody,
    });
  });

  it("ignores a userId in the body and uses the session's", async () => {
    await POST(
      jsonRequest("/api/sessions", { ...validBody, userId: "otro-usuario" }),
    );
    expect(mocks.create.mock.lastCall![0].data.userId).toBe("user-1");
  });

  it("rejects anonymous requests", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(jsonRequest("/api/sessions", validBody));
    expect(response.status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([
    ["a negative score", { ...validBody, score: -1 }],
    ["a fractional score", { ...validBody, score: 1.5 }],
    ["zero exercises", { ...validBody, totalExercises: 0 }],
    ["a missing lessonId", { score: 1, totalExercises: 1 }],
  ])("returns 400 for %s", async (_, body) => {
    const response = await POST(jsonRequest("/api/sessions", body));
    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
