const KNOWN_EXAMPLE_SECRETS = new Set(["change-me-to-a-random-32-char-string"]);
const MIN_PRODUCTION_SECRET_LENGTH = 32;

/**
 * Fail closed in production so session tokens cannot be forged with a
 * missing, short, or documented-example Auth.js secret. Auth.js reads
 * `AUTH_SECRET` first, then `NEXTAUTH_SECRET`.
 */
export function assertProductionAuthSecret(
  secret: string | undefined,
  nodeEnv: string | undefined,
): void {
  if (nodeEnv !== "production") return;

  if (!secret || secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
    throw new Error(
      "AUTH_SECRET must be at least 32 characters in production",
    );
  }

  if (KNOWN_EXAMPLE_SECRETS.has(secret)) {
    throw new Error(
      "AUTH_SECRET must not use the documented example value in production",
    );
  }
}
