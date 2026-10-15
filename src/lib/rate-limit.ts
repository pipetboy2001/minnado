import { prisma } from "@/lib/prisma";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export async function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= limit) {
    return false;
  }

  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}

// Two limits on login: per IP blocks one client from trying many accounts,
// per email blocks a distributed attack on a single account. The email
// limit means an attacker can lock someone out for one window, which is
// the usual tradeoff and much cheaper than letting a password be guessed.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_IP_LIMIT = { limit: 20, windowMs: LOGIN_WINDOW_MS };
const LOGIN_EMAIL_LIMIT = { limit: 10, windowMs: LOGIN_WINDOW_MS };

export async function checkLoginRateLimit(
  email: string,
  ip: string,
): Promise<boolean> {
  // Sequential on purpose: a blocked IP shouldn't also use up the
  // email's budget.
  const ipAllowed = await checkRateLimit(`login:ip:${ip}`, LOGIN_IP_LIMIT);
  if (!ipAllowed) return false;
  return checkRateLimit(
    `login:email:${email.trim().toLowerCase()}`,
    LOGIN_EMAIL_LIMIT,
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
