"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, Check, Clock, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildExam,
  EXAM_SPEEDS,
  exercisesInLessonRange,
  formatCountdown,
  formatDuration,
  getLessonRangeOptions,
  totalExamSeconds,
  type ExamSection,
  type ExamSectionId,
  type ExamSpeed,
} from "@/lib/exam";
import type { Exercise } from "@/types/exercise";
import type { Lesson } from "@/types/content";
import type { JlptLevel } from "@/types/jlpt";
import { gradeExercise, type ExerciseAnswer } from "./grading";
import { EXERCISE_TYPE_META, ExerciseQuestion } from "./exercise-question";

type Phase = "level" | "setup" | "playing" | "finished";
type SectionScores = Record<ExamSectionId, { correct: number; total: number }>;

// Easiest to hardest — same order as the level toggle on the lesson list,
// so the two pickers feel consistent.
const LEVEL_ORDER: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export function ExamPlayer({
  exercises: allExercises,
  lessons: allLessons,
}: {
  exercises: Exercise[];
  lessons: Lesson[];
}) {
  const availableLevels = useMemo(
    () =>
      LEVEL_ORDER.filter((l) =>
        allLessons.some((lesson) => lesson.jlptLevel === l),
      ),
    [allLessons],
  );
  // Skip the picker entirely when there's only one level to choose from —
  // same reasoning as LessonTabs's level toggle.
  const [level, setLevel] = useState<JlptLevel | null>(
    availableLevels.length === 1 ? availableLevels[0] : null,
  );

  const lessons = useMemo(
    () => allLessons.filter((l) => l.jlptLevel === level),
    [allLessons, level],
  );
  const exercises = useMemo(
    () => allExercises.filter((e) => e.jlptLevel === level),
    [allExercises, level],
  );

  const lessonOptions = useMemo(
    () => getLessonRangeOptions(lessons),
    [lessons],
  );
  const minOrder = lessonOptions[0]?.order ?? 1;
  const maxOrder = lessonOptions[lessonOptions.length - 1]?.order ?? 1;

  const [phase, setPhase] = useState<Phase>(level ? "setup" : "level");
  const [timed, setTimed] = useState(false);
  const [fromOrder, setFromOrder] = useState(minOrder);
  const [toOrder, setToOrder] = useState(maxOrder);
  const [speed, setSpeed] = useState<ExamSpeed>(1);

  function selectLevel(chosen: JlptLevel) {
    const options = getLessonRangeOptions(
      allLessons.filter((l) => l.jlptLevel === chosen),
    );
    setLevel(chosen);
    setFromOrder(options[0]?.order ?? 1);
    setToOrder(options[options.length - 1]?.order ?? 1);
    setPhase("setup");
  }

  const pool = useMemo(
    () => exercisesInLessonRange(exercises, lessons, fromOrder, toOrder),
    [exercises, lessons, fromOrder, toOrder],
  );
  const sections = useMemo(() => buildExam(pool, speed), [pool, speed]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [scores, setScores] = useState<SectionScores>({} as SectionScores);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const currentSection: ExamSection | undefined = sections[sectionIndex];
  const currentExercise = currentSection?.exercises[questionIndex];

  function start(withTimer: boolean) {
    setTimed(withTimer);
    setSectionIndex(0);
    setQuestionIndex(0);
    setAnswer(undefined);
    setRevealed(false);
    setScores(
      Object.fromEntries(
        sections.map((s) => [s.id, { correct: 0, total: s.exercises.length }]),
      ) as SectionScores,
    );
    setSecondsLeft(sections[0]?.timeLimitSeconds ?? 0);
    setPhase("playing");
  }

  function goToNextSection() {
    const nextIndex = sectionIndex + 1;
    if (nextIndex >= sections.length) {
      setPhase("finished");
      return;
    }
    setSectionIndex(nextIndex);
    setQuestionIndex(0);
    setAnswer(undefined);
    setRevealed(false);
    setSecondsLeft(sections[nextIndex].timeLimitSeconds);
  }

  // Ticks the countdown once a second while an exam is running in timed
  // mode. Section transitions reset secondsLeft directly (goToNextSection /
  // start), so this effect only needs to react to the clock, not to which
  // section is active.
  useEffect(() => {
    if (phase !== "playing" || !timed) return;
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timed]);

  useEffect(() => {
    if (phase !== "playing" || !timed || secondsLeft > 0) return;
    toast.info(`Se acabó el tiempo para "${currentSection?.title}".`);
    // Reacting to the countdown reaching zero — an external-clock event —
    // not re-deriving state already available during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    goToNextSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  async function handleCheck() {
    if (!answer || !currentExercise || !currentSection) return;
    const isCorrect = gradeExercise(currentExercise, answer);
    setRevealed(true);
    setLastCorrect(isCorrect);
    if (isCorrect) {
      setScores((prev) => ({
        ...prev,
        [currentSection.id]: {
          ...prev[currentSection.id],
          correct: prev[currentSection.id].correct + 1,
        },
      }));
    }

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: currentExercise.id,
        isCorrect,
        userAnswer: answer,
      }),
    });
    if (!response.ok) {
      toast.error("No se pudo guardar este intento.");
    }
  }

  function handleNext() {
    if (!currentSection) return;
    if (questionIndex + 1 < currentSection.exercises.length) {
      setQuestionIndex((i) => i + 1);
      setAnswer(undefined);
      setRevealed(false);
    } else {
      goToNextSection();
    }
  }

  if (availableLevels.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay lecciones con ejercicios para armar un simulacro.
      </p>
    );
  }

  if (phase === "level") {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">
              ¿Qué nivel querés practicar?
            </h2>
            <p className="text-sm text-muted-foreground">
              El simulacro arma sus secciones con las lecciones de ese nivel.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableLevels.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => selectLevel(l)}
                className="rounded-md border-2 border-border px-4 py-6 text-center text-lg font-semibold transition-colors hover:border-primary hover:bg-primary/5"
              >
                {l}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "setup") {
    const totalQuestions = sections.reduce(
      (sum, s) => sum + s.exercises.length,
      0,
    );
    return (
      <div className="flex flex-col gap-5">
        {availableLevels.length > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Simulacro {level}
            </span>
            <button
              type="button"
              onClick={() => setPhase("level")}
              className="text-sm text-muted-foreground underline"
            >
              Cambiar nivel
            </button>
          </div>
        )}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Rango de lecciones</h2>
              <p className="text-sm text-muted-foreground">
                Elige qué tanto de lo que ya estudiaste quieres practicar.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Desde
                <select
                  value={fromOrder}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setFromOrder(next);
                    if (next > toOrder) setToOrder(next);
                  }}
                  className="w-full rounded-md border-2 bg-background px-3 py-2 text-base"
                >
                  {lessonOptions.map((o) => (
                    <option key={o.id} value={o.order}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Hasta
                <select
                  value={toOrder}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setToOrder(next);
                    if (next < fromOrder) setFromOrder(next);
                  }}
                  className="w-full rounded-md border-2 bg-background px-3 py-2 text-base"
                >
                  {lessonOptions.map((o) => (
                    <option key={o.id} value={o.order}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Ritmo del cronómetro</h2>
              <p className="text-sm text-muted-foreground">
                Solo afecta al modo cronometrado — ajusta qué tan apretado es el
                tiempo por sección.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {EXAM_SPEEDS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSpeed(s.value)}
                  className={cn(
                    "rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors",
                    speed === s.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Secciones del simulacro</h2>
              <p className="text-sm text-muted-foreground">
                {sections.length === 0
                  ? "Este rango todavía no tiene ejercicios suficientes."
                  : `${totalQuestions} preguntas en total, tomadas al azar de las lecciones elegidas.`}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>{s.title}</span>
                  <span className="text-muted-foreground">
                    {s.exercises.length} preguntas ·{" "}
                    {formatDuration(s.timeLimitSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="lg"
            className="h-auto flex-col gap-1 py-4"
            disabled={sections.length === 0}
            onClick={() => start(false)}
          >
            <BookOpen />
            <span className="font-semibold">Modo libre</span>
            <span className="text-xs text-muted-foreground">
              Sin límite de tiempo
            </span>
          </Button>
          <Button
            size="lg"
            className="h-auto flex-col gap-1 py-4"
            disabled={sections.length === 0}
            onClick={() => start(true)}
          >
            <Clock />
            <span className="font-semibold">Modo cronometrado</span>
            <span className="text-xs text-primary-foreground/80">
              {formatDuration(totalExamSeconds(sections))} en total
            </span>
          </Button>
        </div>

        <Link
          href="/actividades"
          className="text-center text-sm text-muted-foreground underline"
        >
          Volver a actividades
        </Link>
      </div>
    );
  }

  if (phase === "finished") {
    const overall = Object.values(scores).reduce(
      (acc, s) => ({
        correct: acc.correct + s.correct,
        total: acc.total + s.total,
      }),
      { correct: 0, total: 0 },
    );
    const percentage =
      overall.total === 0
        ? 0
        : Math.round((overall.correct / overall.total) * 100);

    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Trophy className="size-8 text-primary" />
          <h2 className="text-2xl font-bold">¡Simulacro completo!</h2>
          <p className="text-lg">
            {overall.correct} / {overall.total} ({percentage}%)
          </p>
          <ul className="flex w-full flex-col gap-2 text-left">
            {sections.map((s) => {
              const score = scores[s.id];
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>{s.title}</span>
                  <span className="text-muted-foreground">
                    {score?.correct ?? 0} / {score?.total ?? s.exercises.length}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPhase("setup")}>
              Repetir simulacro
            </Button>
            <Button render={<Link href="/actividades/progreso" />}>
              Ver mi progreso
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSection || !currentExercise) return null;

  const sectionProgress =
    (questionIndex / currentSection.exercises.length) * 100;
  const { icon: TypeIcon, label: typeLabel } =
    EXERCISE_TYPE_META[currentExercise.type];

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Sección {sectionIndex + 1}/{sections.length}:{" "}
              {currentSection.title}
            </span>
            {timed && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium tabular-nums",
                  secondsLeft <= 30 && "text-destructive",
                )}
              >
                <Clock className="size-3.5" />
                {formatCountdown(Math.max(secondsLeft, 0))}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {questionIndex + 1} / {currentSection.exercises.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${sectionProgress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TypeIcon className="size-3.5" />
            {typeLabel}
          </span>
          <p className="text-base text-muted-foreground">
            {currentExercise.promptEs}
          </p>
        </div>

        <ExerciseQuestion
          exercise={currentExercise}
          value={answer}
          onChange={setAnswer}
          revealed={revealed}
          disabled={revealed}
        />

        {revealed && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-md p-3 text-sm",
              lastCorrect
                ? "bg-green-600/10 text-green-700 dark:text-green-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {lastCorrect ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {lastCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              {currentExercise.explanationEs && (
                <p className="mt-0.5 text-foreground/80">
                  {currentExercise.explanationEs}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!revealed ? (
            <Button onClick={() => void handleCheck()} disabled={!answer}>
              Comprobar
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {questionIndex + 1 < currentSection.exercises.length ||
              sectionIndex + 1 < sections.length
                ? "Siguiente"
                : "Ver resultado"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
