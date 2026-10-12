"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getSpeechSpeed,
  isSpeechSynthesisSupported,
  setSpeechSpeed,
  SPEECH_SPEEDS,
  type SpeechSpeed,
} from "@/lib/speech";

const LABELS: Record<SpeechSpeed, string> = {
  0.5: "0.5x",
  1: "1x",
  1.5: "1.5x",
};

/**
 * Lets the user pick how fast Japanese audio plays across the whole site
 * (persisted in localStorage, read by speakJapanese). Renders nothing
 * until mounted — same SSR-safe guard as ThemeToggle — and nothing at all
 * if the browser can't speak anyway.
 */
export function SpeechSpeedControl() {
  const [supported, setSupported] = useState(false);
  const [speed, setSpeed] = useState<SpeechSpeed>(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isSpeechSynthesisSupported());
    setSpeed(getSpeechSpeed());
    const onChange = () => setSpeed(getSpeechSpeed());
    window.addEventListener("jp-speech-speed-change", onChange);
    return () => window.removeEventListener("jp-speech-speed-change", onChange);
  }, []);

  if (!supported) return null;

  return (
    <div
      role="group"
      aria-label="Velocidad del audio"
      className="flex items-center overflow-hidden rounded-lg border border-border"
    >
      {SPEECH_SPEEDS.map((value) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={speed === value}
          className={cn(
            "rounded-none border-0",
            speed === value && "bg-muted text-foreground",
          )}
          onClick={() => setSpeechSpeed(value)}
        >
          {LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
