// ===========================================
// FoundIt — Session Management
// ===========================================
// iron-session encrypted cookie-based sessions.
// HttpOnly, Secure (production), SameSite=Lax.
// ===========================================

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { appConfig } from '@/lib/config';

export interface SessionData {
  userId: string;
  role: string;
  displayName: string;
  email: string;
  avatar?: string;
}

const sessionOptions = {
  password: process.env.AUTH_SECRET || 'change-me-to-a-strong-random-secret-at-least-32-chars',
  cookieName: 'foundit_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: appConfig.auth.sessionMaxAge,
    path: '/',
  },
};

/**
 * Get the current session (server-side only)
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Get current user from session, or null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    userId: session.userId,
    role: session.role,
    displayName: session.displayName,
    email: session.email,
    avatar: session.avatar,
  };
}

/**
 * Create a new session for a user
 */
export async function createSession(user: {
  id: string;
  role: string;
  displayName: string;
  email: string;
  avatar?: string | null;
}): Promise<void> {
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.displayName = user.displayName;
  session.email = user.email;
  session.avatar = user.avatar || undefined;
  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
