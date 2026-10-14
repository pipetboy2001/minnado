import { prisma } from "@/lib/prisma";

/**
 * Whether a JWT issued with `tokenVersion` is still valid for this user.
 * Password changes and resets bump the user's sessionVersion, so every
 * token issued before then stops matching. Tokens from before the field
 * existed have no version and count as 0.
 */
export async function isSessionVersionCurrent(
  userId: string,
  tokenVersion: unknown,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true },
  });
  if (!user) return false;
  const version = typeof tokenVersion === "number" ? tokenVersion : 0;
  return user.sessionVersion === version;
}
