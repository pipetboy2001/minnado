import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { parseEnv as ParseEnv } from "./env";

const VALID = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/minnado",
  AUTH_SECRET: "secret",
};

let parseEnv: typeof ParseEnv;

beforeAll(async () => {
  // env.ts valida process.env al importarse.
  vi.stubEnv("DATABASE_URL", VALID.DATABASE_URL);
  vi.stubEnv("AUTH_SECRET", VALID.AUTH_SECRET);
  ({ parseEnv } = await import("./env"));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("parseEnv", () => {
  it("acepta la configuración mínima y aplica defaults", () => {
    const env = parseEnv(VALID);
    expect(env.DATABASE_URL).toBe(VALID.DATABASE_URL);
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_HOST).toBeUndefined();
  });

  it("acepta postgres:// además de postgresql://", () => {
    expect(() =>
      parseEnv({ ...VALID, DATABASE_URL: "postgres://localhost/db" }),
    ).not.toThrow();
  });

  it("falla si faltan las variables obligatorias", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL[\s\S]*AUTH_SECRET/);
  });

  it("trata las variables vacías como no definidas", () => {
    expect(() => parseEnv({ ...VALID, AUTH_SECRET: "" })).toThrow(
      /AUTH_SECRET/,
    );
  });

  it("rechaza una DATABASE_URL que no es de Postgres", () => {
    expect(() =>
      parseEnv({ ...VALID, DATABASE_URL: "mysql://localhost/db" }),
    ).toThrow(/DATABASE_URL/);
  });

  it("convierte SMTP_PORT a número", () => {
    const env = parseEnv({
      ...VALID,
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "465",
      SMTP_USER: "user",
      SMTP_PASS: "pass",
    });
    expect(env.SMTP_PORT).toBe(465);
  });

  it("exige host, usuario y contraseña SMTP juntos", () => {
    expect(() => parseEnv({ ...VALID, SMTP_HOST: "smtp.example.com" })).toThrow(
      /SMTP_USER[\s\S]*SMTP_PASS/,
    );
  });
});
