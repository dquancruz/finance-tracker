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
