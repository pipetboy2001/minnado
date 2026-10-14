import { prisma } from "@/lib/prisma";
import { getAllVocab, getAllKanji } from "@/content/loader";
import type { VocabWord, KanjiEntry } from "@/types/content";

/**
 * Creates a review card (due immediately) for every vocab word and kanji
 * that doesn't have one yet. Cheap to call on every visit to the review
 * page — N5's dataset is small and this only inserts what's missing — and
 * means new content added later is picked up automatically, with no
 * separate "add to review" step for the user.
 */
export async function ensureReviewCardsSeeded(userId: string) {
  const vocab = getAllVocab();
  const kanji = getAllKanji();

  const [existingVocab, existingKanji] = await Promise.all([
    prisma.vocabReviewCard.findMany({
      where: { userId },
      select: { vocabWordId: true },
    }),
    prisma.kanjiReviewCard.findMany({
      where: { userId },
      select: { kanjiEntryId: true },
    }),
  ]);

  const existingVocabIds = new Set(existingVocab.map((c) => c.vocabWordId));
  const existingKanjiIds = new Set(existingKanji.map((c) => c.kanjiEntryId));

  const missingVocab = vocab.filter((w) => !existingVocabIds.has(w.id));
  const missingKanji = kanji.filter((k) => !existingKanjiIds.has(k.id));

  await Promise.all([
    missingVocab.length > 0
      ? prisma.vocabReviewCard.createMany({
          data: missingVocab.map((w) => ({ userId, vocabWordId: w.id })),
        })
      : undefined,
    missingKanji.length > 0
      ? prisma.kanjiReviewCard.createMany({
          data: missingKanji.map((k) => ({ userId, kanjiEntryId: k.id })),
        })
      : undefined,
  ]);
}

export interface DueReviewCards {
  vocab: VocabWord[];
  kanji: KanjiEntry[];
}

export async function getDueReviewCards(
  userId: string,
): Promise<DueReviewCards> {
  const now = new Date();
  const [vocabCards, kanjiCards] = await Promise.all([
    prisma.vocabReviewCard.findMany({
      where: { userId, dueAt: { lte: now } },
      orderBy: { dueAt: "asc" },
      select: { vocabWordId: true },
    }),
    prisma.kanjiReviewCard.findMany({
      where: { userId, dueAt: { lte: now } },
      orderBy: { dueAt: "asc" },
      select: { kanjiEntryId: true },
    }),
  ]);

  const vocabById = new Map(getAllVocab().map((w) => [w.id, w]));
  const kanjiById = new Map(getAllKanji().map((k) => [k.id, k]));

  const vocab = vocabCards
    .map((c) => vocabById.get(c.vocabWordId))
    .filter((w): w is VocabWord => !!w);
  const kanji = kanjiCards
    .map((c) => kanjiById.get(c.kanjiEntryId))
    .filter((k): k is KanjiEntry => !!k);

  return { vocab, kanji };
}

/**
 * Earliest dueAt among all of the user's review cards, vocab or kanji.
 * Only meaningful to call when getDueReviewCards() returned nothing —
 * every enrolled card is then in the future, so the minimum is the next
 * time the user will have something to review.
 */
export async function getNextDueDate(userId: string): Promise<Date | null> {
  const [nextVocab, nextKanji] = await Promise.all([
    prisma.vocabReviewCard.findFirst({
      where: { userId },
      orderBy: { dueAt: "asc" },
      select: { dueAt: true },
    }),
    prisma.kanjiReviewCard.findFirst({
      where: { userId },
      orderBy: { dueAt: "asc" },
      select: { dueAt: true },
    }),
  ]);

  const candidates = [nextVocab?.dueAt, nextKanji?.dueAt].filter(
    (d): d is Date => !!d,
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((min, d) => (d < min ? d : min));
}

export interface ReviewStats {
  totalEnrolled: number;
  totalDue: number;
}

export async function getReviewStats(userId: string): Promise<ReviewStats> {
  const now = new Date();
  const [totalVocab, totalKanji, dueVocab, dueKanji] = await Promise.all([
    prisma.vocabReviewCard.count({ where: { userId } }),
    prisma.kanjiReviewCard.count({ where: { userId } }),
    prisma.vocabReviewCard.count({ where: { userId, dueAt: { lte: now } } }),
    prisma.kanjiReviewCard.count({ where: { userId, dueAt: { lte: now } } }),
  ]);

  return {
    totalEnrolled: totalVocab + totalKanji,
    totalDue: dueVocab + dueKanji,
  };
}
