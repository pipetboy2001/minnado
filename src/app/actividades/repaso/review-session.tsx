"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Coffee,
  Eye,
  PartyPopper,
  RotateCcw,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";
import type { ReviewGrade } from "@/lib/srs";
import type { VocabWord, KanjiEntry } from "@/types/content";

type QueueItem =
  | { kind: "vocab"; itemId: string; word: VocabWord }
  | { kind: "kanji"; itemId: string; kanji: KanjiEntry };

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQueue(vocab: VocabWord[], kanji: KanjiEntry[]): QueueItem[] {
  return shuffle([
    ...vocab.map((word): QueueItem => ({
      kind: "vocab",
      itemId: word.id,
      word,
    })),
    ...kanji.map((k): QueueItem => ({ kind: "kanji", itemId: k.id, kanji: k })),
  ]);
}

export function ReviewSession({
  vocab,
  kanji,
}: {
  vocab: VocabWord[];
  kanji: KanjiEntry[];
}) {
  const [queue] = useState(() => buildQueue(vocab, kanji));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = queue.length;
  const current = queue[index];
  const isFinished = index >= total;

  async function grade(value: ReviewGrade) {
    if (!current || submitting) return;
    setSubmitting(true);

    const response = await fetch("/api/review/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: current.kind,
        itemId: current.itemId,
        grade: value,
      }),
    });

    setSubmitting(false);
    if (!response.ok) {
      toast.error("No se pudo guardar el repaso. Intenta de nuevo.");
      return;
    }

    setIndex((i) => i + 1);
    setRevealed(false);
  }

  if (total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
          <Coffee className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            ¡No tienes repasos pendientes por hoy!
          </h2>
          <p className="text-sm text-muted-foreground">
            Vuelve más tarde — el sistema espacía los repasos según qué tan bien
            recuerdas cada palabra o kanji.
          </p>
          <Link
            href="/actividades"
            className="mt-2 text-sm underline text-muted-foreground"
          >
            Volver a actividades
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isFinished) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <PartyPopper className="size-8 text-primary" />
          <h2 className="text-xl font-bold">¡Repaso completo!</h2>
          <p className="text-muted-foreground">
            Repasaste {total} {total === 1 ? "tarjeta" : "tarjetas"} hoy.
          </p>
          <Link href="/actividades/progreso">
            <Button>Ver mi progreso</Button>
          </Link>
          <Link
            href="/actividades"
            className="text-sm underline text-muted-foreground"
          >
            Volver a actividades
          </Link>
        </CardContent>
      </Card>
    );
  }

  const frontText =
    current.kind === "vocab" ? current.word.word : current.kanji.character;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {index + 1} / {total}
      </p>
      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex items-center gap-2">
            <span className="font-jp text-4xl">{frontText}</span>
            <SpeakButton text={frontText} />
          </div>

          {!revealed ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed(true)}
            >
              <Eye />
              Mostrar respuesta
            </Button>
          ) : current.kind === "vocab" ? (
            <div className="flex flex-col items-center gap-1">
              <p className="font-jp text-lg text-muted-foreground">
                {current.word.reading}
              </p>
              <p className="text-lg">{current.word.meaningEs}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {current.kanji.onyomi.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">音: </span>
                  <span className="font-jp">
                    {current.kanji.onyomi.join("、")}
                  </span>
                </p>
              )}
              {current.kanji.kunyomi.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">訓: </span>
                  <span className="font-jp">
                    {current.kanji.kunyomi.join("、")}
                  </span>
                </p>
              )}
              <p className="text-lg">{current.kanji.meaningEs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {revealed && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            disabled={submitting}
            onClick={() => grade("again")}
          >
            <RotateCcw />
            Otra vez
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={submitting}
            onClick={() => grade("good")}
          >
            <ThumbsUp />
            Bien
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={submitting}
            onClick={() => grade("easy")}
          >
            <Zap />
            Fácil
          </Button>
        </div>
      )}
    </div>
  );
}
