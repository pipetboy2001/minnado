# 0004. Repaso espaciado con SM-2 simplificado

- **Estado:** Aceptado
- **Fecha:** 2026-10-12

## Contexto

Memorizar vocabulario y kanji requiere repasarlos justo antes de olvidarlos. Los estudiantes de japonés ya conocen este modelo por Anki. El sistema tiene que ser fácil de usar (pocos botones) y predecible.

## Decisión

- Implementamos una variante simplificada de **SM-2** (el algoritmo de SuperMemo y Anki) como **función pura**, `scheduleNextReview` en `src/lib/srs.ts`, separada de la persistencia y cubierta por tests.
- Hay tres calificaciones: **again**, **good** y **easy**.
  - **again:** reinicia las repeticiones, el intervalo vuelve a 1 día y el factor de facilidad baja 0.2 (mínimo 1.3).
  - **good:** 1 día en el primer acierto, 6 días en el segundo y desde ahí `intervalo × facilidad`.
  - **easy:** igual que good, pero además sube la facilidad 0.15 y multiplica el intervalo por 1.3.
- Las tarjetas (`VocabReviewCard`, `KanjiReviewCard`) se crean **automáticamente** para todo el vocabulario y kanji al entrar a `/actividades/repaso`. No hay un paso de "agregar al mazo", y el contenido nuevo entra solo.
- Un índice `[userId, dueAt]` hace barata la consulta de "qué toca repasar hoy".

## Alternativas consideradas

- **Leitner (cajas fijas):** más simple, pero no se adapta a la dificultad de cada palabra.
- **FSRS:** más preciso, pero más complejo de implementar y explicar. Es un buen candidato para una versión futura.
- **Las cuatro calificaciones de Anki** (again/hard/good/easy): "hard" aporta poco y suma una decisión más por tarjeta.

## Consecuencias

- El algoritmo es conocido y fácil de testear y razonar, y la lógica pura se puede cambiar sin tocar la base.
- Inscribir todo automáticamente hace que la primera sesión tenga muchas tarjetas pendientes.
