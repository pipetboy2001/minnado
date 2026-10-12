-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "KanjiJlptLevel" AS ENUM ('N5', 'N4');

-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'PRONOUN', 'VERB_RU', 'VERB_U', 'VERB_IRREGULAR', 'I_ADJECTIVE', 'NA_ADJECTIVE', 'ADVERB', 'PARTICLE', 'CONJUNCTION', 'COUNTER', 'EXPRESSION');

-- CreateEnum
CREATE TYPE "GrammarCategory" AS ENUM ('PARTICLES', 'ADJECTIVES_I', 'ADJECTIVES_NA', 'VERB_FORMS', 'SENTENCE_STRUCTURE', 'CONJUGATION', 'QUESTIONS', 'NUMBERS_COUNTERS');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'WORD_ORDER', 'MATCHING');

-- CreateEnum
CREATE TYPE "ExerciseSkill" AS ENUM ('VOCABULARY', 'KANJI', 'GRAMMAR', 'PARTICLES', 'READING', 'LISTENING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_words" (
    "id" TEXT NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningEs" TEXT NOT NULL,
    "meaningEn" TEXT,
    "partOfSpeech" "PartOfSpeech" NOT NULL,
    "exampleSentenceJp" TEXT,
    "exampleSentenceReading" TEXT,
    "exampleSentenceEs" TEXT,
    "tags" TEXT[],
    "lessonId" TEXT,

    CONSTRAINT "vocab_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_entries" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "jlptLevel" "KanjiJlptLevel" NOT NULL,
    "strokeCount" INTEGER NOT NULL,
    "onyomi" TEXT[],
    "kunyomi" TEXT[],
    "meaningEs" TEXT NOT NULL,
    "meaningEn" TEXT,
    "radicals" TEXT[],
    "exampleWords" JSONB NOT NULL,
    "lessonId" TEXT,

    CONSTRAINT "kanji_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_rules" (
    "id" TEXT NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "category" "GrammarCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "explanationEs" TEXT NOT NULL,
    "structureNotes" TEXT,
    "examples" JSONB NOT NULL,
    "relatedGrammarIds" TEXT[],
    "lessonId" TEXT,

    CONSTRAINT "grammar_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "skill" "ExerciseSkill" NOT NULL,
    "promptEs" TEXT NOT NULL,
    "explanationEs" TEXT,
    "difficulty" INTEGER,
    "data" JSONB NOT NULL,
    "lessonId" TEXT,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exercise_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "userAnswer" JSONB NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "lessons_jlptLevel_order_idx" ON "lessons"("jlptLevel", "order");

-- CreateIndex
CREATE INDEX "vocab_words_jlptLevel_idx" ON "vocab_words"("jlptLevel");

-- CreateIndex
CREATE INDEX "kanji_entries_jlptLevel_idx" ON "kanji_entries"("jlptLevel");

-- CreateIndex
CREATE INDEX "grammar_rules_jlptLevel_idx" ON "grammar_rules"("jlptLevel");

-- CreateIndex
CREATE INDEX "exercises_jlptLevel_skill_idx" ON "exercises"("jlptLevel", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_userId_lessonId_key" ON "user_lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "user_exercise_attempts_userId_exerciseId_idx" ON "user_exercise_attempts"("userId", "exerciseId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_words" ADD CONSTRAINT "vocab_words_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_entries" ADD CONSTRAINT "kanji_entries_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_rules" ADD CONSTRAINT "grammar_rules_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_attempts" ADD CONSTRAINT "user_exercise_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_attempts" ADD CONSTRAINT "user_exercise_attempts_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
