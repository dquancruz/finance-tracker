/**
 * Next.js middleware — route protection.
 * Protects all dashboard routes and redirects unauthenticated users to /login.
 */
import { auth } from "@/lib/auth";
import { contentSecurityPolicy } from "@/lib/csp-connect-src";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const AUTH_PATHS = ["/login", "/register"];

function createCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

function buildCsp(origin: string, nonce: string): string {
  // Recompute CSP at request time so `ws:`/`wss:` origins are present even
  // when NEXT_PUBLIC_* was unset at `next build`. A per-request nonce lets
  // Next stamp its scripts without `script-src 'unsafe-inline'`.
  return contentSecurityPolicy({
    nonce,
    connectUrls: [
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NEXT_PUBLIC_WS_URL,
      origin,
    ],
  });
}

export const middleware = auth((req) => {
  const { pathname } = req.nextUrl;
  const nonce = createCspNonce();
  const policy = buildCsp(req.nextUrl.origin, nonce);

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname === "/api/auth" ||
    pathname.startsWith("/api/auth/");

  // Check the expected identity claim instead of treating any truthy auth
  // object as authenticated. This remains fail-closed if Auth.js attaches an
  // error-shaped object to the request.
  const isAuthenticated = Boolean(req.auth?.user?.email);

  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Content-Security-Policy", policy);
    return redirect;
  }

  // Returning users and installed-PWA launches should enter the app, while
  // unauthenticated visitors can still discover the product at `/`.
  if (isAuthenticated && (pathname === "/" || AUTH_PATHS.includes(pathname))) {
    const redirect = NextResponse.redirect(new URL("/dashboard", req.url));
    redirect.headers.set("Content-Security-Policy", policy);
    return redirect;
  }

  // Next.js extracts the nonce from the *request* CSP header during SSR.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", policy);
  return response;
});

export const config = {
  // Exclude static/build assets AND the PWA-installability assets
  // (manifest, generated icons, offline fallback page, service worker
  // script) — these must be publicly fetchable without a session, both for
  // browsers evaluating installability before a user is logged in and for
  // the service worker's own precaching of the offline shell.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|icons/|icon$|apple-icon$|.*\\.svg$).*)",
  ],
};
