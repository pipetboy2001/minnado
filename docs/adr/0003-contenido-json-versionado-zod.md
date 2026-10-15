# 0003. Contenido como JSON versionado y validado con Zod

- **Estado:** Aceptado
- **Fecha:** 2026-10-11

## Contexto

El contenido (lecciones, vocabulario, kanji, gramática y ejercicios de Minna no Nihongo, niveles N5 y N4) es el corazón del producto. Tiene que poder revisarse, corregirse y ampliarse con pull requests, como el código. Un error en un ejercicio, como una opción correcta mal marcada o un id que no existe, rompe la experiencia del estudiante.

## Decisión

- El contenido vive en archivos JSON versionados en el repo: `src/content/{n5,n4}/*.json`.
- Cada archivo se valida contra esquemas **Zod** (`src/content/schema.ts`). Los ejercicios son una unión discriminada por `type`, con reglas como "al menos una opción correcta".
- `src/content/loader.ts` importa los JSON de forma estática, los valida y expone getters memoizados con `React.cache`. Así los ~180 KB de ejercicios no se validan varias veces por request.
- **La app lee el contenido desde los JSON, no desde la base.** La base tiene una copia (`npm run db:seed`) solo para que las tablas de progreso, intentos y tarjetas de repaso tengan **claves foráneas reales** hacia el contenido.
- Los tests (`loader.test.ts`) verifican la integridad: ids únicos, referencias que existen, sintaxis de furigana válida y una sola opción correcta por pregunta. La checklist manual de QA está en [`docs/content-qa-checklist.md`](../content-qa-checklist.md).
- Agregar un nivel (por ejemplo N3) significa agregar sus JSON, sus getters y una entrada en el mapa `LEVELS`.

## Alternativas consideradas

- **Contenido solo en la base de datos, con un panel de administración:** habría que construir y proteger un CMS, y el contenido dejaría de ser revisable en PRs.
- **CMS headless (Sanity, Contentful):** costo, dependencia externa y un esquema fuera del repo.

## Consecuencias

- El contenido se revisa, se versiona y se valida en el CI igual que el código. Contribuir es abrir un PR con JSON.
- No hay costo de API ni latencia de base para leer contenido.
- Hay que mantener la base sincronizada con los JSON (re-ejecutar el seed). Cuando el seed solo cubría N5, guardar progreso de N4 fallaba por violación de clave foránea.
- Cambiar contenido requiere un deploy.
