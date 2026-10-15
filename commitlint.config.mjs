/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Tipos convencionales + `content` (lecciones, vocabulario, kanji).
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "content",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    // Los mensajes van en español y a veces citan nombres propios (N5, Minna no Nihongo).
    "subject-case": [0],
  },
};

export default config;
