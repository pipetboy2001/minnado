import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-route";
import { getExerciseById } from "@/content/loader";
import { gradeExercise, parseAnswer } from "@/components/exercises/grading";

// The client grades too, for instant feedback, but the stored result is
// always recomputed here from the answer: the client's verdict isn't
// trusted (and isn't sent).
const attemptSchema = z.object({
  exerciseId: z.string(),
  userAnswer: z.unknown(),
});

export const POST = withErrorHandling(async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { exerciseId } = parsed.data;
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return NextResponse.json(
      { error: "Ejercicio no encontrado" },
      { status: 404 },
    );
  }

  const userAnswer = parseAnswer(exercise, parsed.data.userAnswer);
  if (!userAnswer) {
    return NextResponse.json(
      { error: "Respuesta inválida para este ejercicio" },
      { status: 400 },
    );
  }

  const isCorrect = gradeExercise(exercise, userAnswer);

  const attempt = await prisma.userExerciseAttempt.create({
    data: {
      userId: session.user.id,
      exerciseId,
      isCorrect,
      userAnswer: userAnswer as never,
    },
    select: { id: true },
  });

  return NextResponse.json({ attempt, isCorrect }, { status: 201 });
}, "attempts");
