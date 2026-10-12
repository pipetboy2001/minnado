# Minnado — Plataforma Open Source de Aprendizaje de Japonés

Plataforma web open source para practicar japonés a nivel **N5/N4**, basada en
el método **Minna no Nihongo**. Incluye vocabulario, kanji, gramática y
ejercicios interactivos (partículas, adjetivos い/な, formas verbales), con
progreso de usuario guardado en base de datos. Sin costos de API — todo el
contenido es estático y versionado en este repositorio.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Prisma](https://www.prisma.io) + [Neon](https://neon.tech) (PostgreSQL serverless)
- [Auth.js (NextAuth v5)](https://authjs.dev) — login con email/contraseña
- [Zod](https://zod.dev) — validación del contenido (vocabulario, kanji, gramática, ejercicios)

## Requisitos

- Node.js 20+
- Una base de datos en [Neon](https://neon.tech) (plan gratuito es suficiente)

## Empezar

1. Clona el repositorio e instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` (o crea `.env`) y completa tu connection string de Neon:

   ```bash
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="genera uno con: npx auth secret"
   ```

3. Aplica las migraciones y carga el contenido de ejemplo (N5):

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Scripts útiles

| Script               | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo                             |
| `npm run build`      | Build de producción                                |
| `npm run lint`       | ESLint                                             |
| `npm run typecheck`  | Verifica tipos de TypeScript                       |
| `npm test`           | Corre la suite de tests (Vitest)                   |
| `npm run format`     | Formatea el proyecto con Prettier                  |
| `npm run db:migrate` | Aplica migraciones de Prisma (desarrollo)          |
| `npm run db:deploy`  | Aplica migraciones de Prisma (producción)          |
| `npm run db:seed`    | Carga el contenido JSON (`src/content`) a Postgres |
| `npm run db:studio`  | Abre Prisma Studio                                 |

## Estructura de contenido

El contenido de las lecciones (vocabulario, kanji, gramática y ejercicios)
vive como JSON tipado y validado en `src/content/n5` y `src/content/n4`. Cada
archivo se valida contra un esquema de [Zod](https://zod.dev) definido en
`src/content/schema.ts` antes de usarse en la app o de sembrarse en la base de
datos (`prisma/seed.ts`), de modo que el contenido agregado por nuevos
colaboradores siempre tenga una forma válida.

Los tipos TypeScript del dominio (incluyendo los cuatro formatos de ejercicio:
opción múltiple, completar espacio, ordenar palabras y emparejar) están en
`src/types`.

## Contribuir

Este es un proyecto open source. Si quieres agregar vocabulario, kanji,
gramática o ejercicios de una lección nueva, agrega los archivos
correspondientes bajo `src/content/<nivel>/` siguiendo el esquema existente —
la validación con Zod te avisará si falta algo.
