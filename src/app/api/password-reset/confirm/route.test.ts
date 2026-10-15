import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashResetToken } from "@/lib/password-reset-token";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({
  findToken: vi.fn(),
  deleteTokens: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    verificationToken: {
      findUnique: mocks.findToken,
      deleteMany: mocks.deleteTokens,
    },
    user: { update: mocks.updateUser },
  },
}));

const { POST } = await import("./route");

const email = "felipe@example.com";
const rawToken = "a".repeat(64);
const validBody = { email, token: rawToken, newPassword: "nueva-clave-123" };
const request = (body: unknown = validBody) =>
  jsonRequest("/api/password-reset/confirm", body);

beforeEach(() => {
  mocks.findToken.mockReset().mockResolvedValue({
    identifier: email,
    token: hashResetToken(rawToken),
    expires: new Date(Date.now() + 60_000),
  });
  mocks.deleteTokens.mockReset().mockResolvedValue({});
  mocks.updateUser.mockReset().mockResolvedValue({});
});

describe("POST /api/password-reset/confirm", () => {
  it("looks the token up by its hash, not the raw value", async () => {
    await POST(request());
    expect(mocks.findToken).toHaveBeenCalledWith({
      where: { token: hashResetToken(rawToken) },
    });
  });

  it("sets the new password (hashed) and consumes the token", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    const { where, data } = mocks.updateUser.mock.lastCall![0];
    expect(where).toEqual({ email });
    expect(await bcrypt.compare(validBody.newPassword, data.passwordHash)).toBe(
      true,
    );
    expect(mocks.deleteTokens).toHaveBeenCalledWith({
      where: { identifier: email },
    });
  });

  it.each([
    ["an unknown token", () => mocks.findToken.mockResolvedValue(null)],
    [
      "an expired token",
      () =>
        mocks.findToken.mockResolvedValue({
          identifier: email,
          expires: new Date(Date.now() - 1),
        }),
    ],
    [
      "a token issued for another email",
      () =>
        mocks.findToken.mockResolvedValue({
          identifier: "otra@example.com",
          expires: new Date(Date.now() + 60_000),
        }),
    ],
  ])("rejects %s without changing the password", async (_, setup) => {
    setup();

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "El enlace es inválido o expiró. Solicita uno nuevo.",
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.deleteTokens).not.toHaveBeenCalled();
  });

  it("returns 400 for a password shorter than 8 characters", async () => {
    const response = await POST(
      request({ ...validBody, newPassword: "corta" }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
    expect(mocks.findToken).not.toHaveBeenCalled();
  });
});
