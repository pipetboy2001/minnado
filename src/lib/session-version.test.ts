import { beforeEach, describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (args: unknown) => findUniqueMock(args) } },
}));

const { isSessionVersionCurrent } = await import("./session-version");

beforeEach(() => {
  findUniqueMock.mockReset();
});

describe("isSessionVersionCurrent", () => {
  it("accepts a token with the user's current version", async () => {
    findUniqueMock.mockResolvedValue({ sessionVersion: 2 });
    expect(await isSessionVersionCurrent("u1", 2)).toBe(true);
  });

  it("rejects a token issued before a password change", async () => {
    findUniqueMock.mockResolvedValue({ sessionVersion: 3 });
    expect(await isSessionVersionCurrent("u1", 2)).toBe(false);
  });

  it("treats tokens without a version as version 0", async () => {
    findUniqueMock.mockResolvedValue({ sessionVersion: 0 });
    expect(await isSessionVersionCurrent("u1", undefined)).toBe(true);

    findUniqueMock.mockResolvedValue({ sessionVersion: 1 });
    expect(await isSessionVersionCurrent("u1", undefined)).toBe(false);
  });

  it("rejects the token if the user no longer exists", async () => {
    findUniqueMock.mockResolvedValue(null);
    expect(await isSessionVersionCurrent("u1", 0)).toBe(false);
  });
});
