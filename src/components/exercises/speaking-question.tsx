"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Furigana } from "@/components/furigana";
import { SpeakButton } from "@/components/speak-button";
import { cn } from "@/lib/utils";
import { stripFuriganaBrackets } from "@/lib/furigana";
import {
  createSpeechRecognition,
  isPronunciationMatch,
  isSpeechRecognitionSupported,
} from "@/lib/speech";
import type { SpeakingExercise } from "@/types/exercise";
import type { SpeakingAnswer } from "./grading";

export function SpeakingQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: SpeakingExercise;
  value?: SpeakingAnswer;
  onChange: (answer: SpeakingAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isSpeechRecognitionSupported());
    return () => recognitionRef.current?.abort();
  }, []);

  function startListening() {
    const recognition = createSpeechRecognition();
    if (!recognition) return;
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      onChange({ transcript });
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu navegador no soporta reconocimiento de voz para este ejercicio. Probá
        con Chrome o Edge de escritorio.
      </p>
    );
  }

  const transcript = value?.transcript;
  const isMatch =
    revealed && !!transcript
      ? isPronunciationMatch(
          stripFuriganaBrackets(exercise.targetJp),
          transcript,
        )
      : false;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Furigana text={exercise.targetJp} className="text-2xl" />
        <SpeakButton text={exercise.targetJp} />
      </div>
      {exercise.translationEs && (
        <p className="text-sm text-muted-foreground">
          {exercise.translationEs}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 py-2">
        <Button
          type="button"
          size="icon-lg"
          variant={listening ? "destructive" : "default"}
          disabled={disabled}
          aria-label={listening ? "Detener grabación" : "Grabar pronunciación"}
          className="size-16 rounded-full"
          onClick={() => {
            if (listening) {
              recognitionRef.current?.stop();
            } else {
              startListening();
            }
          }}
        >
          {listening ? (
            <Square className="size-6" />
          ) : (
            <Mic className="size-6" />
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          {listening ? "Escuchando..." : "Toca para hablar"}
        </p>
      </div>

      {transcript && (
        <div
          className={cn(
            "rounded-md border-2 p-3 text-center text-lg transition-colors",
            !revealed && "border-border",
            revealed &&
              (isMatch
                ? "border-green-600 bg-green-600/10"
                : "animate-shake border-destructive bg-destructive/10"),
          )}
        >
          {transcript}
        </div>
      )}
    </div>
  );
}
