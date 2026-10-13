import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { generateResetToken, hashResetToken } from "@/lib/password-reset-token";
import { checkRateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESET_RATE_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const { email } = parsed.data;
  const allowed = await checkRateLimit(
    `password-reset:${email}`,
    RESET_RATE_LIMIT,
  );
  const user = allowed
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  // Always respond the same way whether or not the account exists (or the
  // request got rate-limited), so this endpoint can't be used to enumerate
  // registered emails or to probe the rate limit itself.
  if (user?.passwordHash) {
    const token = generateResetToken();
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    await prisma.verificationToken.create({
      data: { identifier: email, token: hashResetToken(token), expires },
    });

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
