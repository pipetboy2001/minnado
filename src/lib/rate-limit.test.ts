import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory stand-in for the rate_limit_hits table.
const hits: { key: string; createdAt: Date }[] = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitHit: {
      deleteMany: async ({
        where,
      }: {
        where: { key: string; createdAt: { lt: Date } };
      }) => {
        for (let i = hits.length - 1; i >= 0; i--) {
          if (
            hits[i].key === where.key &&
            hits[i].createdAt < where.createdAt.lt
          ) {
            hits.splice(i, 1);
          }
        }
      },
      count: async ({
        where,
      }: {
        where: { key: string; createdAt: { gte: Date } };
      }) =>
        hits.filter(
          (h) => h.key === where.key && h.createdAt >= where.createdAt.gte,
        ).length,
      create: async ({ data }: { data: { key: string } }) => {
        hits.push({ key: data.key, createdAt: new Date() });
      },
    },
  },
}));

const { checkRateLimit, checkLoginRateLimit, getClientIp } =
  await import("./rate-limit");

beforeEach(() => {
  hits.length = 0;
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows up to the limit and blocks after it", async () => {
    const options = { limit: 2, windowMs: 60_000 };
    expect(await checkRateLimit("k", options)).toBe(true);
    expect(await checkRateLimit("k", options)).toBe(true);
    expect(await checkRateLimit("k", options)).toBe(false);
  });

  it("allows again once the window has passed", async () => {
    vi.useFakeTimers();
    const options = { limit: 1, windowMs: 60_000 };
    expect(await checkRateLimit("k", options)).toBe(true);
    expect(await checkRateLimit("k", options)).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(await checkRateLimit("k", options)).toBe(true);
  });

  it("counts each key separately", async () => {
    const options = { limit: 1, windowMs: 60_000 };
    expect(await checkRateLimit("a", options)).toBe(true);
    expect(await checkRateLimit("b", options)).toBe(true);
  });
});

describe("checkLoginRateLimit", () => {
  it("blocks an email after 10 attempts, even from different IPs", async () => {
    for (let i = 0; i < 10; i++) {
      expect(await checkLoginRateLimit("a@b.cl", `10.0.0.${i}`)).toBe(true);
    }
    expect(await checkLoginRateLimit("a@b.cl", "10.0.0.99")).toBe(false);
  });

  it("treats the email case-insensitively", async () => {
    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit("A@B.cl", `10.0.0.${i}`);
    }
    expect(await checkLoginRateLimit("a@b.cl", "10.0.0.99")).toBe(false);
  });

  it("blocks an IP after 20 attempts across different emails", async () => {
    for (let i = 0; i < 20; i++) {
      expect(await checkLoginRateLimit(`user${i}@b.cl`, "1.2.3.4")).toBe(true);
    }
    expect(await checkLoginRateLimit("otro@b.cl", "1.2.3.4")).toBe(false);
  });

  it("doesn't use up the email's budget while the IP is blocked", async () => {
    for (let i = 0; i < 20; i++) {
      await checkLoginRateLimit(`user${i}@b.cl`, "1.2.3.4");
    }
    for (let i = 0; i < 5; i++) {
      await checkLoginRateLimit("victima@b.cl", "1.2.3.4");
    }
    expect(hits.filter((h) => h.key === "login:email:victima@b.cl")).toEqual(
      [],
    );
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const request = new Request("http://x", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });
    expect(getClientIp(request)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip and then to 'unknown'", () => {
    expect(
      getClientIp(
        new Request("http://x", { headers: { "x-real-ip": "3.3.3.3" } }),
      ),
    ).toBe("3.3.3.3");
    expect(getClientIp(new Request("http://x"))).toBe("unknown");
  });
});
