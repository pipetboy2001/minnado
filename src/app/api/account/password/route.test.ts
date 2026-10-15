import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/auth", () => ({ auth: () => authMock() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (args: unknown) => findUniqueMock(args),
      update: (args: unknown) => updateMock(args),
    },
  },
}));

const { POST } = await import("./route");

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(async () => {
  authMock.mockReset().mockResolvedValue({ user: { id: "user-1" } });
  findUniqueMock
    .mockReset()
    .mockResolvedValue({ passwordHash: await bcrypt.hash("actual-123", 4) });
  updateMock.mockReset().mockResolvedValue({});
});

describe("POST /api/account/password", () => {
  it("bumps sessionVersion so other sessions are signed out", async () => {
    const response = await post({
      currentPassword: "actual-123",
      newPassword: "nueva-12345",
    });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        passwordHash: expect.any(String),
        sessionVersion: { increment: 1 },
      },
    });
  });

  it("doesn't change anything if the current password is wrong", async () => {
    const response = await post({
      currentPassword: "incorrecta",
      newPassword: "nueva-12345",
    });

    expect(response.status).toBe(403);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
