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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
