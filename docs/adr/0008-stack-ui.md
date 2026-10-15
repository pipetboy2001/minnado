# 0008. Stack de UI: shadcn sobre Base UI, Tailwind v4 y React Compiler

- **Estado:** Aceptado
- **Fecha:** 2026-10-11

## Contexto

La interfaz necesita componentes accesibles (diálogos, tabs, menús), modo claro y oscuro, y buen soporte de texto japonés con furigana, sin cargar una librería de componentes pesada ni difícil de personalizar.

## Decisión

- **shadcn/ui** con el estilo `base-nova`, construido sobre **Base UI** (`@base-ui/react`) en lugar de Radix. Los componentes se copian al repo (`src/components/ui`) y son nuestros.
- **Tailwind CSS v4** con configuración en CSS (`@theme` en `globals.css`) y sin `tailwind.config`.
- **React Compiler** (`reactCompiler: true`) para memoizar automáticamente, sin `useMemo` ni `useCallback` manuales.
- El **furigana** se renderiza con `<ruby>`/`<rt>` nativos. El contenido lo escribe a mano con la notación `漢字[かんじ]`, y para chips y opciones se genera automáticamente con un diccionario armado desde el propio contenido.
- **next-themes** para el tema claro, oscuro y del sistema. Las fuentes son Geist y **Noto Sans JP**.

## Alternativas consideradas

- **Radix como base de shadcn:** es la opción por defecto y más difundida. Base UI es su sucesor de los mismos autores, con API más moderna.
- **Una librería de componentes cerrada (MUI, Chakra):** más pesada y más difícil de adaptar al diseño.
- **Furigana con una librería de análisis morfológico (kuromoji):** más automática, pero agrega varios MB de diccionario al cliente.

## Consecuencias

- Los componentes son livianos, accesibles y totalmente editables.
- Base UI, Tailwind v4 y React Compiler son recientes: hay menos ejemplos en internet y más cambios entre versiones.
- Furigana automático solo cubre las palabras del diccionario del contenido.
