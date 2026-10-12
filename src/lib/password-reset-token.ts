import crypto from "crypto";

/**
 * Only the hash is stored in `VerificationToken.token` (reusing Auth.js's
 * otherwise-unused Email-provider table), so a database leak doesn't hand
 * out usable reset links. The raw token goes out in the emailed URL only.
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
