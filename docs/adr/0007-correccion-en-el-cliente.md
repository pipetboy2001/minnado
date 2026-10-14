# 0007. Corrección de ejercicios en el cliente

- **Estado:** Aceptado
- **Fecha:** 2026-10-11

## Contexto

Los ejercicios tienen que dar feedback inmediato (correcto o incorrecto, con su explicación) apenas el estudiante responde. Las respuestas correctas ya están en los JSON de contenido que se envían al navegador para renderizar el ejercicio (ver [0003](0003-contenido-json-versionado-zod.md)).

## Decisión

- La corrección se hace **en el navegador**, en `src/components/exercises/grading.ts`, con una función por tipo de ejercicio.
- El cliente envía `{ exerciseId, isCorrect, userAnswer }` a `/api/attempts`, que valida la forma con Zod y guarda el resultado **sin volver a corregirlo** en el servidor.

## Alternativas consideradas

- **Corregir en el servidor:** impide falsificar resultados, pero suma una ida y vuelta por respuesta. Además, la pronunciación depende del reconocimiento de voz del navegador (ver [0006](0006-web-speech-api.md)), que el servidor no puede verificar.

## Consecuencias

- El feedback es instantáneo y la lógica de corrección se testea como funciones puras.
- **Riesgo aceptado:** un usuario técnico puede falsificar su propio progreso enviando `isCorrect: true`. Solo afecta sus propias estadísticas; no hay rankings ni nada competitivo. Si algún día los hay, habría que mover la corrección al servidor, al menos para los tipos deterministas: opción múltiple, completar, ordenar y emparejar.
