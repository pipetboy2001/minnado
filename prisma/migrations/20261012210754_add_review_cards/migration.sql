-- CreateTable
CREATE TABLE "vocab_review_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabWordId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocab_review_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_review_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanjiEntryId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_review_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocab_review_cards_userId_dueAt_idx" ON "vocab_review_cards"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_review_cards_userId_vocabWordId_key" ON "vocab_review_cards"("userId", "vocabWordId");

-- CreateIndex
CREATE INDEX "kanji_review_cards_userId_dueAt_idx" ON "kanji_review_cards"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_review_cards_userId_kanjiEntryId_key" ON "kanji_review_cards"("userId", "kanjiEntryId");

-- AddForeignKey
ALTER TABLE "vocab_review_cards" ADD CONSTRAINT "vocab_review_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_review_cards" ADD CONSTRAINT "vocab_review_cards_vocabWordId_fkey" FOREIGN KEY ("vocabWordId") REFERENCES "vocab_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_review_cards" ADD CONSTRAINT "kanji_review_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_review_cards" ADD CONSTRAINT "kanji_review_cards_kanjiEntryId_fkey" FOREIGN KEY ("kanjiEntryId") REFERENCES "kanji_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
