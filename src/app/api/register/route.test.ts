import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/api";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: () => "1.2.3.4",
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique, create: mocks.create } },
}));

const { POST } = await import("./route");

const validBody = {
  name: "Felipe",
  email: "felipe@example.com",
  password: "una-clave-segura",
};

beforeEach(() => {
  mocks.checkRateLimit.mockReset().mockResolvedValue(true);
  mocks.findUnique.mockReset().mockResolvedValue(null);
  // Like Prisma, return only the fields the route asks for in `select`.
  mocks.create.mockReset().mockImplementation(async ({ data, select }) => {
    const row: Record<string, unknown> = { id: "user-1", ...data };
    return Object.fromEntries(Object.keys(select).map((k) => [k, row[k]]));
  });
});

describe("POST /api/register", () => {
  it("creates the user with a bcrypt hash, never the plain password", async () => {
    const response = await POST(jsonRequest("/api/register", validBody));

    expect(response.status).toBe(201);
    const { data } = mocks.create.mock.lastCall![0];
    expect(data).not.toHaveProperty("password");
    expect(data.passwordHash).not.toBe(validBody.password);
    expect(await bcrypt.compare(validBody.password, data.passwordHash)).toBe(
      true,
    );
  });

  it("doesn't return the password hash", async () => {
    const response = await POST(jsonRequest("/api/register", validBody));
    expect(mocks.create.mock.lastCall![0].select).toEqual({
      id: true,
      name: true,
      email: true,
    });
    expect(JSON.stringify(await response.json())).not.toContain("passwordHash");
  });

  it("rate-limits by client IP", async () => {
    mocks.checkRateLimit.mockResolvedValue(false);

    const response = await POST(jsonRequest("/api/register", validBody));

    expect(response.status).toBe(429);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      "register:1.2.3.4",
      expect.objectContaining({ limit: 5 }),
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    mocks.findUnique.mockResolvedValue({ id: "existing" });

    const response = await POST(jsonRequest("/api/register", validBody));

    expect(response.status).toBe(409);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty name", { ...validBody, name: "" }, "El nombre es obligatorio"],
    [
      "an invalid email",
      { ...validBody, email: "no-es-correo" },
      "Correo inválido",
    ],
    [
      "a short password",
      { ...validBody, password: "corta" },
      "La contraseña debe tener al menos 8 caracteres",
    ],
  ])("returns 400 with a readable message for %s", async (_, body, error) => {
    const response = await POST(jsonRequest("/api/register", body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns a JSON 500 for a malformed body", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(jsonRequest("/api/register", "{no es json"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Error interno del servidor",
    });
  });
});
