/**
 * Next.js middleware — route protection.
 * Protects all dashboard routes and redirects unauthenticated users to /login.
 */
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export const middleware = auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname === '/api/auth' ||
    pathname.startsWith('/api/auth/');

  // Check the expected identity claim instead of treating any truthy auth
  // object as authenticated. This remains fail-closed if Auth.js attaches an
  // error-shaped object to the request.
  const isAuthenticated = Boolean(req.auth?.user?.email);

  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && PUBLIC_PATHS.includes(pathname)) {
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
