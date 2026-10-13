import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-reset-token";
import { withErrorHandling } from "@/lib/api-route";

const confirmSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const POST = withErrorHandling(async function POST(request: Request) {
  const body = await request.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { email, token, newPassword } = parsed.data;

  const verification = await prisma.verificationToken.findUnique({
    where: { token: hashResetToken(token) },
  });

  if (
    !verification ||
    verification.identifier !== email ||
    verification.expires < new Date()
  ) {
    return NextResponse.json(
      { error: "El enlace es inválido o expiró. Solicita uno nuevo." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return NextResponse.json({ ok: true });
}, "password-reset/confirm");
