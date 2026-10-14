# 0006. Ejercicios de voz con la Web Speech API del navegador

- **Estado:** Aceptado
- **Fecha:** 2026-10-12

## Contexto

Aprender japonés requiere escuchar y hablar. Los servicios de voz en la nube (Google Cloud TTS/STT, Azure, Whisper) cuestan por uso y necesitan API keys en el servidor, algo poco viable para un proyecto open source y gratuito.

## Decisión

- Usamos la **Web Speech API** del navegador (`src/lib/speech.ts`):
  - **Síntesis (TTS):** `speechSynthesis` con voz `ja-JP`, para los botones "escuchar" y los ejercicios de comprensión auditiva. La velocidad es configurable por el usuario.
  - **Reconocimiento (STT):** `SpeechRecognition` con `lang: ja-JP`, para los ejercicios de pronunciación.
- El reconocimiento rara vez devuelve exactamente el texto esperado. Por eso la pronunciación se califica por **similitud de Levenshtein normalizada, con un umbral de 0.75**, después de quitar puntuación y espacios.
- En comprensión auditiva se acepta la respuesta en kanji o en kana, porque el estudiante no tiene por qué adivinar con qué kanji se escribió lo que escuchó.
- Si el navegador no soporta reconocimiento o síntesis, esos ejercicios **se ocultan**, en vez de fallar. La detección se hace después de montar el componente, para evitar errores de hidratación.

## Alternativas consideradas

- **TTS/STT en la nube:** mejor calidad y soporte uniforme, pero con costo variable y API keys que proteger.
- **Audio pregrabado:** calidad natural, pero hay que grabar y alojar cientos de archivos y no sirve para el reconocimiento.

## Consecuencias

- Es gratis, no tiene latencia de red para la síntesis y no hay backend de audio.
- El reconocimiento solo funciona bien en navegadores basados en Chromium. En Firefox y Safari esos ejercicios no aparecen.
- La calidad de la voz depende del sistema operativo del usuario.
