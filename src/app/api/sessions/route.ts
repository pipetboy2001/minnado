import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const sessionSchema = z.object({
  lessonId: z.string(),
  score: z.number().int().nonnegative(),
  totalExercises: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { lessonId, score, totalExercises } = parsed.data;

  const practiceSession = await prisma.practiceSession.create({
    data: { userId: session.user.id, lessonId, score, totalExercises },
    select: { id: true },
  });

  return NextResponse.json({ session: practiceSession }, { status: 201 });
}
