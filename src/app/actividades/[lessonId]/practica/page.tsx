import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonsN5, getExercisesN5 } from "@/content/loader";
import { ExercisePlayer } from "@/components/exercises/exercise-player";

export default async function PracticaPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonsN5().find((l) => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  const exercises = getExercisesN5().filter((e) =>
    lesson.exerciseIds.includes(e.id),
  );

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <Link
        href={`/actividades/${lesson.id}`}
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a la lección
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">{lesson.title}</h1>
      <ExercisePlayer exercises={exercises} lessonId={lesson.id} />
    </div>
  );
}
