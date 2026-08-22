'use server';

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function reportEntity(entityType: 'user' | 'item' | 'lost_item' | 'found_item', entityId: string, reason: string, description: string) {
  try {
    const session = await getAuthenticatedUser();
    enforceRateLimit('general', session.userId, 10, 60 * 60 * 1000); // 10 reports per hour

    const data: any = {
      reporterId: session.userId,
      reason,
      description
    };

    if (entityType === 'user') data.reportedUserId = entityId;
    else if (entityType === 'lost_item') data.lostItemId = entityId;
    else if (entityType === 'found_item' || entityType === 'item') data.foundItemId = entityId;

    await db.report.create({ data });

    return { success: true };
  } catch (error) {
    console.error('Report error:', error);
    return { success: false, error: 'Failed to submit report' };
  }
}

export async function blockUser(userIdToBlock: string, reason?: string) {
  try {
    const session = await getAuthenticatedUser();
    enforceRateLimit('general', session.userId, 20, 60 * 60 * 1000);

    if (session.userId === userIdToBlock) {
      return { success: false, error: 'Cannot block yourself' };
    }

    // Check if already blocked
    const existingBlock = await db.userBlock.findUnique({
      where: {
        blockingUserId_blockedUserId: {
          blockingUserId: session.userId,
          blockedUserId: userIdToBlock
        }
      }
    });

    if (existingBlock) {
      return { success: true }; // Already blocked
    }

    await db.userBlock.create({
      data: {
        blockingUserId: session.userId,
        blockedUserId: userIdToBlock
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Block user error:', error);
    return { success: false, error: 'Failed to block user' };
  }
}
