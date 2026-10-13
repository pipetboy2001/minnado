# Checklist de QA de contenido (N5/N4)

Para usar antes de abrir PR con lecciones, vocabulario, kanji, gramática o ejercicios nuevos. Pensado tanto para un agente que genera contenido como para revisión humana.

- [ ] **Sin romaji visible en ningún lado.** Regla explícita de la clienta — ninguna cadena que el usuario vea debe contener romaji. (El campo `romaji` en el esquema solo se usa internamente para búsqueda en el diccionario, nunca se renderiza.)
- [ ] **Furigana en formato `palabra[lectura]` parsea limpio.** Correr `npm test -- loader.test.ts` — el test "keeps every furigana-bracket string... in sync" recorre todo el contenido y falla si algún `[...]` quedó mal escrito.
- [ ] **Cada entrada de kanji nueva incluye onyomi _y_ kunyomi.** Las `KanjiCard` siempre muestran ambas lecturas.
- [ ] **IDs únicos** dentro de su propio archivo (vocab/kanji/grammar/exercises/lessons). Cubierto por el test "gives every id... a unique id" en `loader.test.ts`.
- [ ] **Todo `lessonId`/`vocabIds`/`kanjiIds`/`grammarIds`/`exerciseIds` referenciado existe realmente.** Cubierto por "only references... ids that actually exist" en `loader.test.ts`.
- [ ] **`jlptLevel` correcto según el enum de Prisma** (`N5`/`N4` para kanji; `N5`–`N1` para vocab/gramática/ejercicios — aunque hoy solo se usan N5/N4).
- [ ] **Todo `exampleSentenceJp` viene acompañado de `exampleSentenceReading` y `exampleSentenceEs`** — no dejar un ejemplo a medias.
- [ ] **El `order` de una lección nueva no choca ni deja huecos** en la secuencia del nivel (hoy N5 va 1→12 sin huecos).
- [ ] **Cada ejercicio de opción múltiple tiene exactamente una opción correcta.** Cubierto por "gives every multiple-choice exercise exactly one correct option".
- [ ] **Cada slot `{{n}}` de un `fill-in-blank` tiene su `blank` correspondiente** y viceversa. Cubierto por "gives every fill-in-blank sentenceTemplate a blank entry...".
- [ ] **El contenido pasa el esquema de Zod sin tirar excepción.** Basta con que `npm test` (o `npm run build`) no truene al cargar `content/loader.ts`.

Antes de abrir PR: `npm test && npm run typecheck`. Todas las reglas de arriba, salvo la de romaji visible (que es manual — revisar la pantalla, no solo el dato), ya están automatizadas en `src/content/loader.test.ts` y `src/lib/furigana.test.ts`.
