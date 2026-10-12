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
import { Button } from "@/components/ui/button";
import { Furigana } from "@/components/furigana";
import { SpeakButton } from "@/components/speak-button";

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
  const grammar = getGrammarN5().filter((g) =>
    lesson.grammarIds.includes(g.id),
  );
  const exercises = getExercisesN5().filter((e) =>
    lesson.exerciseIds.includes(e.id),
  );

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
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
                <div className="flex items-center gap-1">
                  <Furigana
                    text={
                      word.word === word.reading
                        ? word.word
                        : `${word.word}[${word.reading}]`
                    }
                    className="text-xl"
                  />
                  <SpeakButton text={word.word} />
                </div>
                <p className="text-sm">{word.meaningEs}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {kanji.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Kanji</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {kanji.map((k) => (
              <Card key={k.id}>
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <div className="flex items-center gap-1">
                    <Furigana
                      text={`${k.character}[${k.kunyomi[0] ?? k.onyomi[0] ?? ""}]`}
                      className="text-3xl"
                    />
                    <SpeakButton
                      text={k.kunyomi[0] ?? k.onyomi[0] ?? k.character}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{k.meaningEs}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

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
                  <div
                    key={i}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <Furigana text={ex.jp} />
                    <SpeakButton text={ex.jp} />
                    <span>— {ex.es}</span>
                  </div>
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
        <p className="mb-4 text-sm text-muted-foreground">
          Partículas, adjetivos, formas verbales, vocabulario y más — en formato
          de opción múltiple, completar espacio, ordenar palabras, emparejar y
          pronunciación.
        </p>
        <Button render={<Link href={`/actividades/${lesson.id}/practica`} />}>
          Practicar ejercicios
        </Button>
      </section>
    </div>
  );
}
