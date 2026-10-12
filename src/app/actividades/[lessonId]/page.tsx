import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getLessonsN5,
  getVocabN5,
  getKanjiN5,
  getGrammarN5,
  getExercisesN5,
} from "@/content/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonsN5().find((l) => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  const vocab = getVocabN5().filter((v) => lesson.vocabIds.includes(v.id));
  const kanji = getKanjiN5().filter((k) => lesson.kanjiIds.includes(k.id));
  const grammar = getGrammarN5().filter((g) => lesson.grammarIds.includes(g.id));
  const exercises = getExercisesN5().filter((e) =>
    lesson.exerciseIds.includes(e.id)
  );

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link href="/actividades" className="text-sm text-muted-foreground underline">
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-1 text-2xl font-bold">{lesson.title}</h1>
      <p className="mb-6 text-muted-foreground">{lesson.description}</p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Vocabulario</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {vocab.map((word) => (
            <Card key={word.id}>
              <CardContent className="p-4">
                <p className="text-xl">{word.word}</p>
                <p className="text-sm text-muted-foreground">{word.reading}</p>
                <p className="text-sm">{word.meaningEs}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Kanji</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {kanji.map((k) => (
            <Card key={k.id}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl">{k.character}</p>
                <p className="text-sm text-muted-foreground">{k.meaningEs}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Gramática</h2>
        <div className="flex flex-col gap-3">
          {grammar.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <CardTitle className="text-base">{rule.title}</CardTitle>
                <CardDescription>{rule.pattern}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">{rule.explanationEs}</p>
                {rule.examples.map((ex, i) => (
                  <p key={i} className="text-muted-foreground">
                    {ex.jp} — {ex.es}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Ejercicios ({exercises.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          El motor interactivo de ejercicios se implementará en el próximo
          ticket (JPN-2). Por ahora, estos son los tipos de ejercicio
          disponibles en esta lección: {" "}
          {Array.from(new Set(exercises.map((e) => e.type))).join(", ")}.
        </p>
      </section>
    </div>
  );
}
