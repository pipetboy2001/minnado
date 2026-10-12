import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const attemptSchema = z.object({
  exerciseId: z.string(),
  isCorrect: z.boolean(),
  userAnswer: z.unknown(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { exerciseId, isCorrect, userAnswer } = parsed.data;

  const attempt = await prisma.userExerciseAttempt.create({
    data: {
      userId: session.user.id,
      exerciseId,
      isCorrect,
      userAnswer: userAnswer as never,
    },
    select: { id: true },
  });

  return NextResponse.json({ attempt }, { status: 201 });
}
