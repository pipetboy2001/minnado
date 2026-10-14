import { notFound } from "next/navigation";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { getAllLessons, getLevelContent } from "@/content/loader";
import { ExercisePlayer } from "@/components/exercises/exercise-player";

export default async function PracticaPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getAllLessons().find((l) => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  const exercises = getLevelContent(lesson.jlptLevel)
    .exercises()
    .filter((e) => lesson.exerciseIds.includes(e.id));

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <Link
        href={`/actividades/${lesson.id}`}
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a la lección
      </Link>
      <h1 className="mt-2 mb-6 flex items-center gap-2 text-2xl font-bold">
        <ListChecks className="size-6 text-muted-foreground" />
        {lesson.title}
      </h1>
      <ExercisePlayer exercises={exercises} lessonId={lesson.id} />
    </div>
  );
}
