import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/report', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers ────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // ─── Reset Password Token Exchange ───────
  if (pathname === '/auth/reset-password') {
    const token = request.nextUrl.searchParams.get('token');
    
    // Set no-store headers on reset pages
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    // Ensure Referrer-Policy is strict for reset flow
    response.headers.set('Referrer-Policy', 'no-referrer');
    
    if (token) {
      // Basic plausibility check (hex string, right length)
      if (/^[0-9a-fA-F]{64}$/.test(token)) {
        const cleanUrl = new URL('/auth/reset-password', request.url);
        const redirectResponse = NextResponse.redirect(cleanUrl);
        
        // Set short-lived secure cookie
        redirectResponse.cookies.set({
          name: 'foundit_reset_token',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 60, // 30 minutes
          path: '/auth/reset-password'
        });
        
        return redirectResponse;
      }
    }
  }

  // ─── Route Protection (cookie check) ─────
  // Note: Full auth verification happens server-side in page components.
  // This middleware provides a fast redirect for obvious unauthenticated access.
  const sessionCookie = request.cookies.get('foundit_session');
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Prevent logged-in users from accessing auth pages ─
  const authPaths = ['/login', '/register', '/forgot-password'];
  if (authPaths.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/uploads).*)',
  ],
};
