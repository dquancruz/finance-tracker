'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker (`/public/sw.js`) once the app has
 * mounted in the browser. Skipped outside production: an active SW
 * intercepting fetches during local dev fights with Next's Fast Refresh
 * and can serve stale bundles after a rebuild.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      // Non-fatal: the app still works without a service worker, it just
      // won't be installable / offline-capable.
      console.error('Service worker registration failed', error);
    });
  }, []);

  return null;
}
