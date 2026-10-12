import { cn } from "@/lib/utils";
import {
  parseFuriganaBrackets,
  autoFurigana,
  type FuriganaSegment,
} from "@/lib/furigana";

export function RubyText({ segments }: { segments: FuriganaSegment[] }) {
  return (
    <span className="font-jp">
      {segments.map((segment, i) =>
        segment.reading ? (
          <ruby key={i}>
            {segment.text}
            <rt className="select-none text-[0.6em] text-muted-foreground">
              {segment.reading}
            </rt>
          </ruby>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

/**
 * Renders Japanese text with inline furigana using <ruby>/<rt>.
 * Use bracket notation in `text` (e.g. "大き[おおき]い") for sentences
 * that need precise, hand-authored readings.
 */
export function Furigana({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("font-jp", className)}>
      <RubyText segments={parseFuriganaBrackets(text)} />
    </span>
  );
}

/**
 * Renders a short, exact Japanese string (a single word, particle, or
 * option) with furigana looked up automatically from the content's
 * vocabulary/kanji dictionary — no bracket notation needed.
 */
export function AutoFurigana({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("font-jp", className)}>
      <RubyText segments={autoFurigana(text)} />
    </span>
  );
}
