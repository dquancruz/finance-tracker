const DEFAULT_AUTH_REDIRECT = '/';

/**
 * Accept only same-origin relative application paths.
 *
 * Next.js router navigation accepts scheme URLs, so values read from a query
 * string must not be passed to router.push() without this check.
 */
export function safeAuthRedirect(
  candidate: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, 'https://finance-tracker.invalid');
    return parsed.origin === 'https://finance-tracker.invalid'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
