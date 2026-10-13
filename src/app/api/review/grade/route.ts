import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scheduleNextReview } from "@/lib/srs";
import { withErrorHandling } from "@/lib/api-route";

const gradeSchema = z.object({
  type: z.enum(["vocab", "kanji"]),
  itemId: z.string().min(1),
  grade: z.enum(["again", "good", "easy"]),
});

export const POST = withErrorHandling(async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { type, itemId, grade } = parsed.data;
  const userId = session.user.id;

  if (type === "vocab") {
    const card = await prisma.vocabReviewCard.findUnique({
      where: { userId_vocabWordId: { userId, vocabWordId: itemId } },
    });
    if (!card) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 },
      );
    }

    const next = scheduleNextReview(card, grade);
    await prisma.vocabReviewCard.update({
      where: { id: card.id },
      data: { ...next, lastReviewedAt: new Date() },
    });
  } else {
    const card = await prisma.kanjiReviewCard.findUnique({
      where: { userId_kanjiEntryId: { userId, kanjiEntryId: itemId } },
    });
    if (!card) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 },
      );
    }

    const next = scheduleNextReview(card, grade);
    await prisma.kanjiReviewCard.update({
      where: { id: card.id },
      data: { ...next, lastReviewedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}, "review/grade");
