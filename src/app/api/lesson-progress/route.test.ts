import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), upsert: vi.fn() }));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { userLessonProgress: { upsert: mocks.upsert } },
}));

const { POST } = await import("./route");

beforeEach(() => {
  mocks.auth.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  mocks.upsert.mockReset().mockResolvedValue({ id: "progress-1" });
});

describe("POST /api/lesson-progress", () => {
  it("marks the lesson completed, creating or updating the row", async () => {
    const response = await POST(
      jsonRequest("/api/lesson-progress", { lessonId: "n5-lesson-01" }),
    );

    expect(response.status).toBe(200);
    const args = mocks.upsert.mock.lastCall![0];
    expect(args.where).toEqual({
      userId_lessonId: { userId: "user-1", lessonId: "n5-lesson-01" },
    });
    expect(args.create).toMatchObject({
      userId: "user-1",
      lessonId: "n5-lesson-01",
      completed: true,
    });
    expect(args.update).toMatchObject({ completed: true });
    expect(args.update.completedAt).toBeInstanceOf(Date);
  });

  it("rejects anonymous requests", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(
      jsonRequest("/api/lesson-progress", { lessonId: "n5-lesson-01" }),
    );
    expect(response.status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("returns 400 without a lessonId", async () => {
    const response = await POST(jsonRequest("/api/lesson-progress", {}));
    expect(response.status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
