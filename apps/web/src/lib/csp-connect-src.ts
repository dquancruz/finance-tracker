/**
 * Build CSP `connect-src` entries from API / WebSocket base URLs.
 *
 * Socket.IO in this app uses `transports: ['websocket']` only, so browsers
 * that do not map `http`→`ws` (or `https`→`wss`) would otherwise block
 * realtime. Trailing paths on env values are stripped to the origin.
 */
export function connectSourcesFor(url: string | undefined): string[] {
  if (!url) return [];

  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    if (parsed.protocol === "https:") {
      return [origin, origin.replace(/^https:/, "wss:")];
    }
    if (parsed.protocol === "http:") {
      return [origin, origin.replace(/^http:/, "ws:")];
    }
    return [origin];
  } catch {
    if (url.startsWith("https://")) {
      return [url, url.replace(/^https:/, "wss:")];
    }
    if (url.startsWith("http://")) {
      return [url, url.replace(/^http:/, "ws:")];
    }
    return [url];
  }
}

export function buildConnectSrcDirective(
  ...urls: Array<string | undefined>
): string {
  const sources = new Set<string>(["'self'"]);
  for (const url of urls) {
    for (const source of connectSourcesFor(url)) {
      sources.add(source);
    }
  }
  return Array.from(sources).join(" ");
}

export function scriptSrcDirective(
  nonce?: string,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  // Nonce + `'strict-dynamic'` lets Next.js stamp its runtime scripts while
  // ignoring host allowlists in CSP3 browsers. `'self'` remains as a
  // fallback for browsers that do not understand `'strict-dynamic'`.
  // `'unsafe-inline'` is intentionally omitted: it would let XSS run and
  // read `session.accessToken` (API JWTs still live on the client session
  // until a BFF/proxy follow-up can keep them server-side).
  // React's development runtime still needs `'unsafe-eval'`; production does not.
  const unsafeEval = nodeEnv === "development" ? " 'unsafe-eval'" : "";
  if (nonce) {
    return `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${unsafeEval}`;
  }
  return `script-src 'self'${unsafeEval}`;
}

export function contentSecurityPolicy(options?: {
  nonce?: string;
  connectUrls?: Array<string | undefined>;
  nodeEnv?: string;
}): string {
  const connectUrls = options?.connectUrls ?? [];
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://accounts.google.com",
    `connect-src ${buildConnectSrcDirective(...connectUrls)}`,
    "img-src 'self' data: https://lh3.googleusercontent.com",
    "font-src 'self' data:",
    scriptSrcDirective(options?.nonce, options?.nodeEnv),
    "style-src 'self' 'unsafe-inline'",
  ].join("; ");
}
