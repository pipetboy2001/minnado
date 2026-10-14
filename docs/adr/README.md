# Architecture Decision Records

Registro de las decisiones técnicas importantes de Minnado: qué se decidió, por qué y qué consecuencias tiene. Cada ADR es corto e inmutable. Si una decisión cambia, se escribe un ADR nuevo que reemplaza al anterior y se marca el viejo como "Reemplazado".

| #                                             | Decisión                                                       | Estado   |
| --------------------------------------------- | -------------------------------------------------------------- | -------- |
| [0001](0001-neon-prisma-driver-adapter.md)    | Postgres serverless en Neon con Prisma 7 y driver adapter      | Aceptado |
| [0002](0002-authjs-credenciales-jwt.md)       | Auth.js v5 con credenciales, sesiones JWT y config edge-safe   | Aceptado |
| [0003](0003-contenido-json-versionado-zod.md) | Contenido como JSON versionado y validado con Zod              | Aceptado |
| [0004](0004-srs-sm2-simplificado.md)          | Repaso espaciado con SM-2 simplificado                         | Aceptado |
| [0005](0005-rate-limiting-postgres.md)        | Rate limiting de ventana fija respaldado en Postgres           | Aceptado |
| [0006](0006-web-speech-api.md)                | Ejercicios de voz con la Web Speech API del navegador          | Aceptado |
| [0007](0007-correccion-en-el-cliente.md)      | Corrección de ejercicios en el cliente                         | Aceptado |
| [0008](0008-stack-ui.md)                      | Stack de UI: shadcn sobre Base UI, Tailwind v4, React Compiler | Aceptado |

## Plantilla

Para un ADR nuevo, copia [`template.md`](template.md) con el siguiente número correlativo.
