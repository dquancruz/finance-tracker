const DOCUMENTED_EXAMPLE_SECRET = "change-me-to-a-random-32-char-string";

export function assertSecureAuthEnvironment(
  env: Readonly<Record<string, string | undefined>>,
): void {
  if (env["NODE_ENV"] !== "production") return;

  const configuredSecret = env["AUTH_SECRET"] ?? env["NEXTAUTH_SECRET"];
  if (configuredSecret === DOCUMENTED_EXAMPLE_SECRET) {
    throw new Error(
      "AUTH_SECRET/NEXTAUTH_SECRET must not use the documented example value in production",
    );
  }
}
