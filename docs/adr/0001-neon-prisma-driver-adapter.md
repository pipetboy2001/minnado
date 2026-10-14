# 0001. Postgres serverless en Neon con Prisma 7 y driver adapter

- **Estado:** Aceptado
- **Fecha:** 2026-10-11

## Contexto

La app se despliega en Vercel, donde cada función serverless abre y cierra conexiones con frecuencia. Una conexión TCP tradicional a Postgres por invocación agota rápido el límite de conexiones del servidor. Además, el proyecto es open source y sin presupuesto: la base de datos tiene que tener un plan gratuito suficiente.

## Decisión

- Usamos **Neon** (Postgres serverless) con su **connection string pooled**.
- Accedemos con **Prisma 7** a través de `@prisma/adapter-neon` (`src/lib/prisma.ts`). Así las consultas viajan por el driver serverless de Neon, en vez del motor de conexiones nativo de Prisma.
- La URL de la base no vive en `schema.prisma` sino en `prisma7.config.ts`, como pide Prisma 7.
- El cliente se genera en `src/generated/prisma`, no se commitea y se regenera en `postinstall` y en `build`. Un checkout limpio en Vercel fallaba con "Module not found" sin esto.
- En desarrollo, el cliente se guarda en `globalThis` para que el hot reload no abra un cliente nuevo en cada cambio.

## Alternativas consideradas

- **Postgres tradicional (Railway, RDS, Supabase con conexión directa):** obliga a montar un pooler aparte para no agotar conexiones desde serverless.
- **SQLite / Turso:** más simple, pero el proyecto quería Postgres para los tipos `Json`, los enums y las migraciones de Prisma sin limitaciones.

## Consecuencias

- Funciona bien en serverless sin infraestructura extra, y el plan gratuito de Neon alcanza.
- El CI levanta un Postgres 16 real y verifica que el schema no se desfase de las migraciones (`prisma migrate diff --exit-code`). Eso atrapa un `schema.prisma` editado sin su migración.
- Dependemos de un adapter de Prisma relativamente nuevo. Una actualización mayor de Prisma o de Neon puede requerir ajustes.
