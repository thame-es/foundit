// ===========================================
// FoundIt — Authorization Guards
// ===========================================
// Server-side auth + role + ownership checks.
// ===========================================

import { redirect } from 'next/navigation';
import { getCurrentUser, SessionData } from './session';
import { db } from '@/lib/db';
import { userRoles } from '@/lib/config';

/**
 * Require authentication. Redirects to login if not authenticated.
 * For use in Server Components and Server Actions.
 */
export async function requireAuth(): Promise<SessionData> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Require admin role. Redirects to home if not admin.
 */
export async function requireAdmin(): Promise<SessionData> {
  const user = await requireAuth();
  if (user.role !== userRoles.ADMIN) {
    redirect('/');
  }
  return user;
}

/**
 * Check if the current user owns a specific lost item
 */
export async function requireLostItemOwnership(itemId: string): Promise<SessionData> {
  const user = await requireAuth();
  const item = await db.lostItem.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!item || (item.userId !== user.userId && user.role !== userRoles.ADMIN)) {
    redirect('/dashboard');
  }
  return user;
}

/**
 * Check if the current user owns a specific found item
 */
export async function requireFoundItemOwnership(itemId: string): Promise<SessionData> {
  const user = await requireAuth();
  const item = await db.foundItem.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!item || (item.userId !== user.userId && user.role !== userRoles.ADMIN)) {
    redirect('/dashboard');
  }
  return user;
}

/**
 * Check if the current user is a participant in a conversation
 */
export async function requireConversationAccess(conversationId: string): Promise<SessionData> {
  const user = await requireAuth();
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!conversation || 
      (conversation.user1Id !== user.userId && 
       conversation.user2Id !== user.userId && 
       user.role !== userRoles.ADMIN)) {
    redirect('/dashboard/messages');
  }
  return user;
}

/**
 * API-style guard that returns the user or throws (for server actions)
 */
export async function getAuthenticatedUser(): Promise<SessionData> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * API-style guard that requires admin role or throws
 */
export async function getAdminUser(): Promise<SessionData> {
  const user = await getAuthenticatedUser();
  if (user.role !== userRoles.ADMIN) {
    throw new Error('Admin access required');
  }
  return user;
}

/**
 * Check if a user is blocked by another user
 */
export async function isBlocked(userId: string, otherUserId: string): Promise<boolean> {
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockingUserId: userId, blockedUserId: otherUserId },
        { blockingUserId: otherUserId, blockedUserId: userId },
      ],
    },
  });
  return !!block;
}
