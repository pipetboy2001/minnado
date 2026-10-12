"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stripFuriganaBrackets } from "@/lib/furigana";
import { isSpeechSynthesisSupported, speakJapanese } from "@/lib/speech";

/**
 * "Escuchar" button that reads Japanese text aloud via the browser's
 * speechSynthesis — free, no API key, no backend. Accepts bracket-notation
 * furigana (e.g. "大き[おおき]い") and strips it before speaking. Renders
 * nothing if the browser doesn't support speech synthesis, same SSR-safe
 * mount guard as ThemeToggle.
 */
export function SpeakButton({
  text,
  rate,
  size = "icon-sm",
  variant = "ghost",
  className,
  iconClassName,
}: {
  text: string;
  rate?: number;
  size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  variant?: "ghost" | "outline" | "default" | "secondary";
  className?: string;
  iconClassName?: string;
}) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isSpeechSynthesisSupported());
  }, []);

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label="Escuchar pronunciación"
      className={cn(
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        speakJapanese(stripFuriganaBrackets(text), rate);
      }}
    >
      <Volume2 className={iconClassName} />
    </Button>
  );
}
