const KNOWN_EXAMPLE_SECRETS = new Set(["change-me-to-a-random-32-char-string"]);

/**
 * Reject the documented placeholder so production session tokens cannot be
 * forged with the value published in `apps/web/.env.example`. Auth.js reads
 * `AUTH_SECRET` first, then `NEXTAUTH_SECRET`.
 */
export function assertProductionAuthSecret(
  secret: string | undefined,
  nodeEnv: string | undefined,
): void {
  if (nodeEnv === "production" && secret && KNOWN_EXAMPLE_SECRETS.has(secret)) {
    throw new Error(
      "NEXTAUTH_SECRET must not use the documented example value in production",
    );
  }
}
