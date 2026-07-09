/**
 * Next.js middleware — route protection.
 * Protects all dashboard routes and redirects unauthenticated users to /login.
 */
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export const middleware = auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api/auth');

  const isAuthenticated = !!(req as { auth?: unknown }).auth;

  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Exclude static/build assets AND the PWA-installability assets
  // (manifest, generated icons, offline fallback page, service worker
  // script) — these must be publicly fetchable without a session, both for
  // browsers evaluating installability before a user is logged in and for
  // the service worker's own precaching of the offline shell.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|icons/|icon$|apple-icon$|.*\\.svg$).*)',
  ],
};
