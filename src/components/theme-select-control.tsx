"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
] as const;

/**
 * Explicit light/dark/system picker for the settings page. ThemeToggle
 * (the icon button used in page headers elsewhere) only flips between
 * light and dark — this is the one place "system" is reachable without
 * clearing localStorage by hand.
 */
export function ThemeSelectControl() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes only knows the stored preference after mount (to avoid
    // an SSR hydration mismatch), same guard as ThemeToggle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      role="group"
      aria-label="Tema"
      className="flex items-center overflow-hidden rounded-lg border border-border"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={mounted && theme === value}
          className={cn(
            "rounded-none border-0",
            mounted && theme === value && "bg-muted text-foreground",
          )}
          onClick={() => setTheme(value)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
