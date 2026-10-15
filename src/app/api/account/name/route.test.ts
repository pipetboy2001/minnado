import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), update: vi.fn() }));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: mocks.update } },
}));

const { POST } = await import("./route");

beforeEach(() => {
  mocks.auth.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  mocks.update.mockReset().mockResolvedValue({});
});

describe("POST /api/account/name", () => {
  it("updates only the signed-in user's name, trimmed", async () => {
    const response = await POST(
      jsonRequest("/api/account/name", { name: "  Felipe  " }),
    );

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Felipe" },
    });
  });

  it("rejects anonymous requests", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(
      jsonRequest("/api/account/name", { name: "Felipe" }),
    );
    expect(response.status).toBe(401);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([
    ["a blank name", "   "],
    ["a name over 100 characters", "a".repeat(101)],
  ])("returns 400 for %s", async (_, name) => {
    const response = await POST(jsonRequest("/api/account/name", { name }));
    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
