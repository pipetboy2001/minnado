# 0002. Auth.js v5 con credenciales, sesiones JWT y config edge-safe

- **Estado:** Aceptado
- **Fecha:** 2026-10-11

## Contexto

La app necesita cuentas para guardar el progreso, pero no tiene sentido depender de un proveedor externo (Google, GitHub) para una plataforma de estudio. La protección de rutas corre en el proxy de Next.js 16 (antes "middleware"), que se ejecuta en el runtime Edge, donde no funcionan Prisma ni bcrypt.

## Decisión

- Usamos **Auth.js v5** con el provider **Credentials** (email y contraseña). Las contraseñas se guardan con **bcrypt**, costo 10.
- La configuración se divide en dos:
  - `src/auth.config.ts` es edge-safe: sin adapter ni bcrypt. La usa el proxy (`src/proxy.ts`) para proteger `/actividades/*`.
  - `src/auth.ts` es la configuración completa, con `PrismaAdapter` y la verificación de contraseñas.
- Las sesiones son **JWT** (`session.strategy: "jwt"`). Es la estrategia que Auth.js permite con Credentials, y evita una consulta a la base por request.
- Hay un **segundo guard** en `src/app/actividades/layout.tsx` que llama a `auth()`. Antes, algunas páginas de lecciones no verificaban la sesión y se podían abrir sin login.
- **Reset de contraseña:**
  - El token es aleatorio de 32 bytes, y solo se guarda su **hash SHA-256**, en la tabla `VerificationToken` de Auth.js, que de otro modo no se usa.
  - Vence en 1 hora. La respuesta es siempre la misma, exista o no la cuenta, para no revelar qué emails están registrados.

## Alternativas consideradas

- **OAuth (Google, GitHub):** menos fricción para algunos usuarios, pero agrega dependencia de terceros y configuración de apps externas.
- **Sesiones en base de datos:** permiten revocar sesiones al instante, pero no son compatibles con Credentials en Auth.js y suman una consulta por request.
- **Servicio gestionado (Clerk, Auth0):** resuelve todo, pero con costo y lock-in, poco razonable para un proyecto open source.

## Consecuencias

- No hay dependencia de terceros para entrar y el proxy funciona en Edge.
- Un JWT no se puede revocar antes de que expire. Cambiar la contraseña no cierra las sesiones abiertas en otros dispositivos.
- Somos responsables de la seguridad de las contraseñas: hashing, reset y rate limiting (ver [0005](0005-rate-limiting-postgres.md)).
