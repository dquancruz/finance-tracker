/**
 * Minimal PWA service worker.
 *
 * Scope is intentionally narrow: this is NOT an aggressive offline-first
 * cache of the whole app (the dashboard shows live financial data — serving
 * stale cached data instead of a clear "you're offline" state would be
 * actively misleading). Instead it:
 *
 *  1. Precaches a tiny app-shell (the offline fallback page + icons) so the
 *     app can show *something* useful when there's no network.
 *  2. Uses network-first for navigations (HTML documents), falling back to
 *     the cached offline page only when the network request fails.
 *  3. Uses cache-first for the app's own static assets (`/_next/static/...`),
 *     which are content-hashed and safe to cache indefinitely.
 *  4. Never intercepts API calls (`/api/...` on this origin, or requests to
 *     the separate API/WebSocket origin) — those must always hit the
 *     network so the user never sees stale balances/expenses.
 */

const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const STATIC_ASSET_CACHE = `static-assets-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const APP_SHELL_URLS = [OFFLINE_URL, '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key !== APP_SHELL_CACHE && key !== STATIC_ASSET_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (API/WS) calls
  if (isApiRequest(url)) return; // always hit the network for API routes

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  if (isNextStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
  }
});
