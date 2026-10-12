"use client";

import { Input } from "@/components/ui/input";
import { Furigana } from "@/components/furigana";
import { SpeakButton } from "@/components/speak-button";
import { cn } from "@/lib/utils";
import { stripFuriganaBrackets } from "@/lib/furigana";
import { normalizeSpeech } from "@/lib/speech";
import type { ListeningExercise } from "@/types/exercise";
import type { ListeningAnswer } from "./grading";

export function ListeningQuestion({
  exercise,
  value,
  onChange,
  revealed,
  disabled,
}: {
  exercise: ListeningExercise;
  value?: ListeningAnswer;
  onChange: (answer: ListeningAnswer) => void;
  revealed: boolean;
  disabled: boolean;
}) {
  const text = value?.text ?? "";
  const normalizedInput = normalizeSpeech(text);
  const acceptedForms = [
    stripFuriganaBrackets(exercise.targetJp),
    exercise.targetReading,
  ].filter((form): form is string => !!form);
  const isMatch =
    revealed &&
    !!normalizedInput &&
    acceptedForms.some((form) => normalizedInput === normalizeSpeech(form));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 py-2">
        <SpeakButton
          text={exercise.targetJp}
          variant="outline"
          size="icon-lg"
          className="size-16 rounded-full"
          iconClassName="size-6"
          rate={0.85}
        />
        <p className="text-sm text-muted-foreground">
          Toca para escuchar (puedes repetirlo)
        </p>
      </div>

      <Input
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
        disabled={disabled}
        placeholder="Escribe en japonés lo que escuchaste..."
        className={cn(
          "text-center text-lg font-jp",
          revealed &&
            (isMatch ? "border-green-600" : "animate-shake border-destructive"),
        )}
      />

      {revealed && (
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>Respuesta correcta:</span>
          <Furigana text={exercise.targetJp} className="text-lg" />
        </div>
      )}
    </div>
  );
}
