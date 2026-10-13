/**
 * Builds a JLPT-style mock exam ("simulacro") out of the N5 exercise pool:
 * grouped into the same broad sections the real test uses (vocab/kanji,
 * grammar, listening — speaking is excluded, since the real JLPT doesn't
 * test it either), each capped to a realistic question count and given a
 * time budget derived from real exam pacing. Used in both timed and
 * untimed exam mode — untimed just skips the countdown, same sections.
 */
import type { Exercise } from "@/types/exercise";
import type { Lesson } from "@/types/content";
import type { ExerciseSkill } from "@/types/jlpt";

export type ExamSectionId = "vocab-kanji" | "grammar" | "listening";

interface ExamSectionDef {
  id: ExamSectionId;
  title: string;
  skills: ExerciseSkill[];
  maxQuestions: number;
  secondsPerQuestion: number;
}

const SECTION_DEFS: ExamSectionDef[] = [
  {
    id: "vocab-kanji",
    title: "Vocabulario y Kanji",
    skills: ["vocabulary", "kanji"],
    maxQuestions: 20,
    secondsPerQuestion: 30,
  },
  {
    id: "grammar",
    title: "Gramática",
    skills: ["grammar", "particles"],
    maxQuestions: 20,
    secondsPerQuestion: 35,
  },
  {
    id: "listening",
    title: "Comprensión auditiva",
    skills: ["listening"],
    maxQuestions: 10,
    secondsPerQuestion: 60,
  },
];

export interface ExamSection {
  id: ExamSectionId;
  title: string;
  exercises: Exercise[];
  timeLimitSeconds: number;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface LessonRangeOption {
  id: string;
  order: number;
  title: string;
}

/** Sequential (non-review) lessons, in order, for the "from lesson / to
 * lesson" range picker — review modules draw on multiple lessons at once
 * and don't fit a linear range. */
export function getLessonRangeOptions(lessons: Lesson[]): LessonRangeOption[] {
  return lessons
    .filter((l) => l.kind === "lesson")
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ id: l.id, order: l.order, title: l.title }));
}

/** Narrows the exercise pool to only the lessons whose `order` falls within
 * [fromOrder, toOrder] — so "simulacro de lecciones 1 a 5" only draws on
 * what the learner has actually studied so far, not the whole level. */
export function exercisesInLessonRange(
  exercises: Exercise[],
  lessons: Lesson[],
  fromOrder: number,
  toOrder: number,
): Exercise[] {
  const idsInRange = new Set(
    lessons
      .filter((l) => l.order >= fromOrder && l.order <= toOrder)
      .flatMap((l) => l.exerciseIds),
  );
  return exercises.filter((e) => idsInRange.has(e.id));
}

/** Omits any section a content level doesn't have enough exercises for yet. */
export function buildExam(exercises: Exercise[]): ExamSection[] {
  return SECTION_DEFS.map((def) => {
    const pool = exercises.filter((e) => def.skills.includes(e.skill));
    const picked = shuffle(pool).slice(0, def.maxQuestions);
    return {
      id: def.id,
      title: def.title,
      exercises: picked,
      timeLimitSeconds: picked.length * def.secondsPerQuestion,
    };
  }).filter((section) => section.exercises.length > 0);
}

export function totalExamSeconds(sections: ExamSection[]): number {
  return sections.reduce((sum, s) => sum + s.timeLimitSeconds, 0);
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return "menos de 1 min";
  return `${Math.round(totalSeconds / 60)} min`;
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
