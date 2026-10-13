import Link from "next/link";
import { Library } from "lucide-react";
import { getVocabN5, getKanjiN5, getKanjiN4 } from "@/content/loader";
import { DictionaryBrowser } from "./dictionary-browser";

export default function DictionaryPage() {
  const vocab = getVocabN5();
  const kanji = [...getKanjiN5(), ...getKanjiN4()];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-1 flex items-center gap-2 text-2xl font-bold">
        <Library className="size-6 text-muted-foreground" />
        Diccionario
      </h1>
      <p className="mb-6 text-muted-foreground">
        Busca cualquier palabra o kanji que ya viste en las lecciones, sin tener
        que volver a entrar a cada una.
      </p>
      <DictionaryBrowser vocab={vocab} kanji={kanji} />
    </div>
  );
}
