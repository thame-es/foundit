// ===========================================
// FoundIt — Google OAuth: Callback Handler
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { hashPassword } from '@/lib/auth/password';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Handle errors from Google
  if (error) {
    logger.error('Google OAuth error', { error });
    return NextResponse.redirect(new URL('/login?error=google_denied', baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=google_invalid', baseUrl));
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;
  cookieStore.delete('google_oauth_state');

  if (!storedState || storedState !== state) {
    logger.security('Google OAuth state mismatch');
    return NextResponse.redirect(new URL('/login?error=google_csrf', baseUrl));
  }

  try {
    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      logger.error('Google token exchange failed', { status: tokenRes.status, body: errBody });
      return NextResponse.redirect(new URL('/login?error=google_token', baseUrl));
    }

    const tokens = await tokenRes.json();

    // Fetch user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      logger.error('Google userinfo fetch failed');
      return NextResponse.redirect(new URL('/login?error=google_userinfo', baseUrl));
    }

    const googleUser = await userInfoRes.json();
    const { email, name, picture, sub: googleId } = googleUser;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=google_no_email', baseUrl));
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        googleId: true,
      },
    });

    if (user) {
      // Existing user — check status
      if (user.status === 'suspended') {
        return NextResponse.redirect(new URL('/login?error=account_suspended', baseUrl));
      }
      if (user.status === 'deactivated') {
        return NextResponse.redirect(new URL('/login?error=account_deactivated', baseUrl));
      }

      // Link Google account if not already linked
      if (!user.googleId) {
        await db.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || picture },
        });
      }

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      // Create new user from Google profile
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      user = await db.user.create({
        data: {
          email,
          displayName: name || email.split('@')[0],
          passwordHash,
          googleId,
          avatar: picture || undefined,
          emailVerifiedAt: new Date(), // Google emails are pre-verified
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          googleId: true,
        },
      });

      logger.info('User registered via Google', { userId: user.id, email });
    }

    // Create session
    await createSession(user);
    logger.info('User logged in via Google', { userId: user.id });

    return NextResponse.redirect(new URL('/dashboard', baseUrl));
  } catch (err) {
    logger.error('Google OAuth callback error', { error: String(err) });
    return NextResponse.redirect(new URL('/login?error=google_unknown', baseUrl));
  }
}
