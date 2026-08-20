// ===========================================
// FoundIt — Google OAuth: Redirect to Google
// ===========================================

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  // Generate CSRF state token
  const state = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
