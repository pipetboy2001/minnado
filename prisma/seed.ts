import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import {
  getVocabN5,
  getKanjiN5,
  getKanjiN4,
  getGrammarN5,
  getLessonsN5,
  getExercisesN5,
} from "../src/content/loader";
import type { Exercise } from "../src/types/exercise";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toEnum(value: string) {
  return value.toUpperCase().replace(/-/g, "_");
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function exerciseData(exercise: Exercise) {
  const {
    id: _id,
    type: _type,
    jlptLevel: _jlptLevel,
    skill: _skill,
    lessonId: _lessonId,
    promptEs: _promptEs,
    explanationEs: _explanationEs,
    difficulty: _difficulty,
    ...data
  } = exercise;
  return data;
}

async function main() {
  const lessons = getLessonsN5();
  const vocab = getVocabN5();
  const kanji = [...getKanjiN5(), ...getKanjiN4()];
  const grammar = getGrammarN5();
  const exercises = getExercisesN5();

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: {
        jlptLevel: lesson.jlptLevel,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description,
      },
      create: {
        id: lesson.id,
        jlptLevel: lesson.jlptLevel,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description,
      },
    });
  }
  console.log(`Lecciones sincronizadas: ${lessons.length}`);

  for (const word of vocab) {
    const lessonId = lessons.find((l) => l.vocabIds.includes(word.id))?.id ?? null;
    const data = {
      jlptLevel: word.jlptLevel,
      word: word.word,
      reading: word.reading,
      romaji: word.romaji,
      meaningEs: word.meaningEs,
      meaningEn: word.meaningEn,
      partOfSpeech: toEnum(word.partOfSpeech) as never,
      exampleSentenceJp: word.exampleSentenceJp,
      exampleSentenceReading: word.exampleSentenceReading,
      exampleSentenceEs: word.exampleSentenceEs,
      tags: word.tags ?? [],
      lessonId,
    };
    await prisma.vocabWord.upsert({
      where: { id: word.id },
      update: data,
      create: { id: word.id, ...data },
    });
  }
  console.log(`Vocabulario sincronizado: ${vocab.length}`);

  for (const entry of kanji) {
    const lessonId = lessons.find((l) => l.kanjiIds.includes(entry.id))?.id ?? null;
    const data = {
      character: entry.character,
      jlptLevel: entry.jlptLevel,
      strokeCount: entry.strokeCount,
      onyomi: entry.onyomi,
      kunyomi: entry.kunyomi,
      meaningEs: entry.meaningEs,
      meaningEn: entry.meaningEn,
      radicals: entry.radicals ?? [],
      exampleWords: toJson(entry.exampleWords),
      lessonId,
    };
    await prisma.kanjiEntry.upsert({
      where: { id: entry.id },
      update: data,
      create: { id: entry.id, ...data },
    });
  }
  console.log(`Kanji sincronizados: ${kanji.length}`);

  for (const rule of grammar) {
    const lessonId = lessons.find((l) => l.grammarIds.includes(rule.id))?.id ?? null;
    const data = {
      jlptLevel: rule.jlptLevel,
      category: toEnum(rule.category) as never,
      title: rule.title,
      pattern: rule.pattern,
      explanationEs: rule.explanationEs,
      structureNotes: rule.structureNotes,
      examples: toJson(rule.examples),
      relatedGrammarIds: rule.relatedGrammarIds ?? [],
      lessonId,
    };
    await prisma.grammarRule.upsert({
      where: { id: rule.id },
      update: data,
      create: { id: rule.id, ...data },
    });
  }
  console.log(`Reglas de gramática sincronizadas: ${grammar.length}`);

  for (const exercise of exercises) {
    const data = {
      type: toEnum(exercise.type) as never,
      jlptLevel: exercise.jlptLevel,
      skill: toEnum(exercise.skill) as never,
      promptEs: exercise.promptEs,
      explanationEs: exercise.explanationEs,
      difficulty: exercise.difficulty,
      data: toJson(exerciseData(exercise)),
      lessonId: exercise.lessonId ?? null,
    };
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: data,
      create: { id: exercise.id, ...data },
    });
  }
  console.log(`Ejercicios sincronizados: ${exercises.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
