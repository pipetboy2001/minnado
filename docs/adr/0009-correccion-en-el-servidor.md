# 0009. Corrección de ejercicios en el servidor

- **Estado:** Aceptado
- **Fecha:** 2026-10-14

## Contexto

[0007](0007-correccion-en-el-cliente.md) aceptó corregir en el cliente y confiar en el `isCorrect` que mandaba, con el riesgo documentado de que un usuario técnico lo falsificara para inflar su propio progreso. Ese progreso ahora alimenta el repaso espaciado ([0004](0004-srs-sm2-simplificado.md)) y las estadísticas de `/progreso`: un `isCorrect` falso ya no es inocuo, distorsiona cuándo el SRS vuelve a mostrar una tarjeta.

## Decisión

- `POST /api/attempts` ya no recibe `isCorrect` del cliente: recibe `{ exerciseId, userAnswer }`, busca el ejercicio por id (`getExerciseById`), valida `userAnswer` contra el shape que espera su tipo con Zod (`parseAnswer` en `grading.ts`) y corrige con `gradeExercise` en el servidor. El cliente sigue corrigiendo en paralelo para el feedback instantáneo, pero lo que se guarda es siempre el resultado del servidor.
- Esto incluye los tipos que [0007](0007-correccion-en-el-cliente.md) daba por no verificables en el servidor (`speaking`, `listening`): el servidor no reconoce audio, pero sí puede comparar el texto/transcripción recibido contra la respuesta esperada con la misma lógica de normalización que ya usaba el cliente.

## Alternativas consideradas

- **Mantener la corrección en el cliente** (statu quo de 0007): ya no alcanza ahora que el resultado alimenta el repaso espaciado, no solo las estadísticas del propio usuario.

## Consecuencias

- Ya no se puede falsificar el progreso enviando `isCorrect: true` a mano.
- Una ida y vuelta más por respuesta antes de persistir el intento (el feedback visual sigue siendo instantáneo porque el cliente ya corrigió localmente).
- `grading.ts` y `getExerciseById` quedan compartidos entre cliente y servidor, así que un cambio en las reglas de corrección de un tipo de ejercicio no puede desalinearse entre los dos.
