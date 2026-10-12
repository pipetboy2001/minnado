import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";
import type { KanjiEntry } from "@/types/content";

export function KanjiCard({
  kanji,
  showLevel,
}: {
  kanji: KanjiEntry;
  showLevel?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
        <div className="flex items-center gap-1">
          <span className="font-jp text-3xl">{kanji.character}</span>
          {showLevel && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {kanji.jlptLevel}
            </span>
          )}
        </div>
        {kanji.onyomi.length > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">音:</span>
            <span className="font-jp">{kanji.onyomi.join("、")}</span>
            <SpeakButton text={kanji.onyomi.join("、")} size="icon-xs" />
          </div>
        )}
        {kanji.kunyomi.length > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">訓:</span>
            <span className="font-jp">{kanji.kunyomi.join("、")}</span>
            <SpeakButton text={kanji.kunyomi.join("、")} size="icon-xs" />
          </div>
        )}
        <p className="text-sm text-muted-foreground">{kanji.meaningEs}</p>
      </CardContent>
    </Card>
  );
}
