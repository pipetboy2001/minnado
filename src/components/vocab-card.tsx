import { Card, CardContent } from "@/components/ui/card";
import { Furigana } from "@/components/furigana";
import { SpeakButton } from "@/components/speak-button";
import type { VocabWord } from "@/types/content";

export function VocabCard({
  word,
  showLevel,
}: {
  word: VocabWord;
  showLevel?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-1">
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
          {showLevel && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {word.jlptLevel}
            </span>
          )}
        </div>
        <p className="text-sm">{word.meaningEs}</p>
      </CardContent>
    </Card>
  );
}
