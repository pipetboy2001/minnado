import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashResetToken } from "@/lib/password-reset-token";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  findUser: vi.fn(),
  deleteTokens: vi.fn(),
  createToken: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/mailer", () => ({ sendPasswordResetEmail: mocks.sendEmail }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    verificationToken: {
      deleteMany: mocks.deleteTokens,
      create: mocks.createToken,
    },
  },
}));

const { POST } = await import("./route");

const email = "felipe@example.com";
const request = () => jsonRequest("/api/password-reset/request", { email });

beforeEach(() => {
  vi.useRealTimers();
  mocks.checkRateLimit.mockReset().mockResolvedValue(true);
  mocks.findUser.mockReset().mockResolvedValue({ passwordHash: "hash" });
  mocks.deleteTokens.mockReset().mockResolvedValue({});
  mocks.createToken.mockReset().mockResolvedValue({});
  mocks.sendEmail.mockReset().mockResolvedValue(undefined);
});

describe("POST /api/password-reset/request", () => {
  it("emails a reset link and stores only the token's hash", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    const [to, resetUrl] = mocks.sendEmail.mock.lastCall!;
    expect(to).toBe(email);

    const url = new URL(resetUrl);
    expect(url.origin + url.pathname).toBe("http://localhost/reset-password");
    expect(url.searchParams.get("email")).toBe(email);
    const rawToken = url.searchParams.get("token")!;
    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);

    const stored = mocks.createToken.mock.lastCall![0].data;
    expect(stored.identifier).toBe(email);
    expect(stored.token).toBe(hashResetToken(rawToken));
    expect(stored.token).not.toBe(rawToken);
  });

  it("expires the token after one hour", async () => {
    vi.useFakeTimers({ now: new Date("2026-01-01T00:00:00Z") });
    await POST(request());
    expect(mocks.createToken.mock.lastCall![0].data.expires).toEqual(
      new Date("2026-01-01T01:00:00Z"),
    );
  });

  it("invalidates previous reset tokens for that email", async () => {
    await POST(request());
    expect(mocks.deleteTokens).toHaveBeenCalledWith({
      where: { identifier: email },
    });
    expect(mocks.deleteTokens.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.createToken.mock.invocationCallOrder[0],
    );
  });

  it.each([
    ["the account doesn't exist", () => mocks.findUser.mockResolvedValue(null)],
    [
      "the account has no password",
      () => mocks.findUser.mockResolvedValue({ passwordHash: null }),
    ],
    [
      "the request is rate-limited",
      () => mocks.checkRateLimit.mockResolvedValue(false),
    ],
  ])(
    "responds exactly the same, without sending anything, when %s",
    async (_, setup) => {
      setup();

      const response = await POST(request());

      // Same status and body as the success case, so the endpoint can't be
      // used to find out which emails are registered.
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(mocks.sendEmail).not.toHaveBeenCalled();
      expect(mocks.createToken).not.toHaveBeenCalled();
    },
  );

  it("doesn't even look the user up once rate-limited", async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    await POST(request());
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      `password-reset:${email}`,
      expect.objectContaining({ limit: 3 }),
    );
    expect(mocks.findUser).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(
      jsonRequest("/api/password-reset/request", { email: "no-es-correo" }),
    );
    expect(response.status).toBe(400);
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });
});
