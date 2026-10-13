"use client";

import { useMemo, useState } from "react";
import { BookText, PenTool, Search } from "lucide-react";
import { IconInput } from "@/components/ui/icon-input";
import { Button } from "@/components/ui/button";
import { VocabCard } from "@/components/vocab-card";
import { KanjiCard } from "@/components/kanji-card";
import type { VocabWord, KanjiEntry } from "@/types/content";

type Tab = "vocab" | "kanji";

export function DictionaryBrowser({
  vocab,
  kanji,
}: {
  vocab: VocabWord[];
  kanji: KanjiEntry[];
}) {
  const [tab, setTab] = useState<Tab>("vocab");
  const [query, setQuery] = useState("");

  const filteredVocab = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vocab;
    return vocab.filter(
      (w) =>
        w.word.includes(q) ||
        w.reading.includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meaningEs.toLowerCase().includes(q),
    );
  }, [vocab, query]);

  const filteredKanji = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return kanji;
    return kanji.filter(
      (k) =>
        k.character.includes(q) ||
        k.onyomi.some((r) => r.includes(q)) ||
        k.kunyomi.some((r) => r.includes(q)) ||
        k.meaningEs.toLowerCase().includes(q),
    );
  }, [kanji, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={tab === "vocab" ? "default" : "outline"}
          onClick={() => setTab("vocab")}
        >
          <BookText />
          Vocabulario ({vocab.length})
        </Button>
        <Button
          type="button"
          variant={tab === "kanji" ? "default" : "outline"}
          onClick={() => setTab("kanji")}
        >
          <PenTool />
          Kanji ({kanji.length})
        </Button>
      </div>

      <IconInput
        icon={Search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          tab === "vocab"
            ? "Buscar por palabra, lectura, romaji o significado..."
            : "Buscar por kanji, lectura o significado..."
        }
      />

      {tab === "vocab" &&
        (filteredVocab.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin resultados.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredVocab.map((word) => (
              <VocabCard key={word.id} word={word} showLevel />
            ))}
          </div>
        ))}

      {tab === "kanji" &&
        (filteredKanji.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin resultados.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {filteredKanji.map((k) => (
              <KanjiCard key={k.id} kanji={k} showLevel />
            ))}
          </div>
        ))}
    </div>
  );
}
