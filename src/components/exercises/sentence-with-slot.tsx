import { cn } from "@/lib/utils";
import { parseFuriganaBrackets } from "@/lib/furigana";
import { RubyText } from "@/components/furigana";

export type SlotState = "empty" | "filled" | "correct" | "incorrect";

/**
 * Renders a Japanese sentence (with bracket-notation furigana) that
 * contains a single {{slotId}} placeholder, shown as a Duolingo-style
 * box instead of a bare underscore — empty/dashed until answered, then
 * filled with the chosen text and colored once revealed.
 */
export function SentenceWithSlot({
  text,
  slotId,
  slotValue,
  slotState,
  className,
}: {
  text: string;
  slotId: string;
  slotValue?: string;
  slotState: SlotState;
  className?: string;
}) {
  const [before, after] = text.split(new RegExp(`\\{\\{${slotId}\\}\\}`));

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xl leading-loose font-jp",
        className,
      )}
    >
      {before && <RubyText segments={parseFuriganaBrackets(before)} />}
      <span
        className={cn(
          "inline-flex min-w-12 items-center justify-center rounded-md border-2 px-2 py-0.5 text-lg transition-all",
          slotState === "empty" &&
            "border-dashed border-muted-foreground/40 text-muted-foreground",
          slotState === "filled" &&
            "scale-105 border-primary bg-primary/10 font-medium shadow-sm",
          slotState === "correct" &&
            "border-green-600 bg-green-600/10 font-medium",
          slotState === "incorrect" &&
            "animate-shake border-destructive bg-destructive/10 font-medium",
        )}
      >
        {slotValue || " "}
      </span>
      {after && <RubyText segments={parseFuriganaBrackets(after)} />}
    </p>
  );
}
