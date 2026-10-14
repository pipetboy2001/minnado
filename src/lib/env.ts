import { z } from "zod";

const SMTP_KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

export const envSchema = z
  .object({
    DATABASE_URL: z.url({
      protocol: /^postgres(ql)?$/,
      error: "debe ser una connection string de Postgres (postgresql://...)",
    }),
    AUTH_SECRET: z
      .string({ error: "es obligatorio (genera uno con: npx auth secret)" })
      .min(1, "es obligatorio (genera uno con: npx auth secret)"),
    // SMTP es opcional (solo lo usa el reset de contraseña), pero si se
    // configura, deben venir host, usuario y contraseña juntos.
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const configured = SMTP_KEYS.filter((key) => env[key] !== undefined);
    if (configured.length === 0 || configured.length === SMTP_KEYS.length) {
      return;
    }
    for (const key of SMTP_KEYS) {
      if (env[key] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `es obligatorio si se configura ${configured.join(", ")}`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  // Las variables vacías en .env (FOO="") cuentan como no definidas.
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== ""),
  );
  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Variables de entorno inválidas:\n${details}\nRevisa tu .env (ver .env.example).`,
    );
  }
  return result.data;
}

export const env = parseEnv(process.env);

export const isSmtpConfigured = env.SMTP_HOST !== undefined;
