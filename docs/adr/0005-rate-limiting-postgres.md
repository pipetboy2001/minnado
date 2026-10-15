# 0005. Rate limiting de ventana fija respaldado en Postgres

- **Estado:** Aceptado
- **Fecha:** 2026-10-12

## Contexto

El registro y la solicitud de reset de contraseña estaban expuestos al abuso: creación masiva de cuentas y envío de muchos correos de reset a la bandeja de una víctima. En serverless no se puede limitar en memoria, porque cada instancia tiene la suya.

## Decisión

- Implementamos un limitador de **ventana fija** respaldado en **Postgres**, en `src/lib/rate-limit.ts` y la tabla `rate_limit_hits`, **sin dependencias nuevas**. En cada llamada:
  1. Borra los registros de esa clave más antiguos que la ventana.
  2. Cuenta los registros dentro de la ventana.
  3. Si no llegó al límite, inserta uno nuevo.
- Dónde se aplica:
  - **Registro:** 5 intentos cada 15 minutos por IP (`register:<ip>`), con respuesta 429.
  - **Reset de contraseña:** 3 solicitudes cada 15 minutos por email (`password-reset:<email>`). La respuesta es idéntica esté limitado o no, para no revelar nada.

## Alternativas consideradas

- **Redis / Upstash:** es lo estándar y es atómico, pero agrega un servicio y una cuenta más.
- **Rate limiting del proveedor (Vercel Firewall):** menos control por endpoint y depende del plan.
- **En memoria:** no funciona con varias instancias serverless.

## Consecuencias

- No hay infraestructura extra; reutiliza la base que ya existe.
- Contar e insertar no es atómico: con requests concurrentes se puede superar el límite por poco. Es aceptable para este volumen de tráfico.
- Cada request limitada cuesta unas consultas a la base.
- Aún no cubre el login ni los endpoints de cuenta.
