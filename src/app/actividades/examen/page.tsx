import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getAllExercises, getAllLessons } from "@/content/loader";
import { ExamPlayer } from "@/components/exercises/exam-player";

export default function ExamenPage() {
  const exercises = getAllExercises();
  const lessons = getAllLessons();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-1 flex items-center gap-2 text-2xl font-bold">
        <GraduationCap className="size-6 text-muted-foreground" />
        Simulacro
      </h1>
      <p className="mb-6 text-muted-foreground">
        Un examen de práctica con preguntas de vocabulario, kanji, gramática y
        comprensión auditiva — elige si quieres practicarlo sin tiempo o
        cronometrado como el examen real.
      </p>
      <ExamPlayer exercises={exercises} lessons={lessons} />
    </div>
  );
}
