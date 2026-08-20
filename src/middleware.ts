import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/report', '/admin'];
const authPaths = ['/login', '/register', '/forgot-password'];

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Hand off to next-intl for locale routing
  const response = intlMiddleware(request);

  // ─── Security Headers ────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // ─── Route Protection (cookie check) ─────
  const sessionCookie = request.cookies.get('foundit_session');
  
  // Strip locale prefix for checking paths (e.g. /en/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|ml)/, '') || '/';
  
  const isProtected = protectedPaths.some(path => pathWithoutLocale.startsWith(path));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL(`/${routing.defaultLocale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Prevent logged-in users from accessing auth pages ─
  if (authPaths.includes(pathWithoutLocale) && sessionCookie) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/uploads).*)',
  ],
};
