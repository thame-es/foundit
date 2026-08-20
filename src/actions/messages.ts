'use server';

// ===========================================
// FoundIt — Messaging Server Actions
// ===========================================

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { enforceRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  claimId: z.string().optional(),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

export async function sendMessage(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    enforceRateLimit('general', user.userId, 60, 60 * 1000); // 60 msgs per minute

    const conversationId = formData.get('conversationId') as string | null;
    const claimId = formData.get('claimId') as string | null;
    const content = formData.get('content') as string;

    const result = sendMessageSchema.safeParse({ conversationId: conversationId || undefined, claimId: claimId || undefined, content });
    if (!result.success) {
      return { success: false, error: 'Invalid message data' };
    }

    if (!conversationId && !claimId) {
      return { success: false, error: 'Must provide either conversationId or claimId' };
    }

    // Resolve conversation
    let conversation;

    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: { user1: true, user2: true, claim: { include: { foundItem: true } } }
      });
      if (!conversation) return { success: false, error: 'Conversation not found' };
      if (conversation.user1Id !== user.userId && conversation.user2Id !== user.userId) {
        return { success: false, error: 'Unauthorized' };
      }
    } else if (claimId) {
      const claim = await db.claim.findUnique({
        where: { id: claimId },
        include: { foundItem: true, claimant: true }
      });
      if (!claim) return { success: false, error: 'Claim not found' };
      if (claim.status !== 'approved') return { success: false, error: 'Claim must be approved to initiate messaging' };
      if (claim.claimantId !== user.userId && claim.foundItem.userId !== user.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      // Check if conversation already exists
      conversation = await db.conversation.findUnique({
        where: { claimId: claimId },
        include: { user1: true, user2: true, claim: { include: { foundItem: true } } }
      });

      // If not, create it
      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            claimId: claim.id,
            user1Id: claim.foundItem.userId, // Finder
            user2Id: claim.claimantId,       // Claimant
          },
          include: { user1: true, user2: true, claim: { include: { foundItem: true } } }
        });
      }
    }

    if (!conversation) return { success: false, error: 'Failed to resolve conversation' };

    if (conversation.status !== 'active') {
      return { success: false, error: 'This conversation is no longer active' };
    }

    // Determine recipient
    const recipientId = conversation.user1Id === user.userId ? conversation.user2Id : conversation.user1Id;

    // Send Message
    const message = await db.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.userId,
          content,
        }
      });

      // Update conversation timestamp
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      // Optional: Create a notification if they aren't online (using a simple model for MVP)
      await tx.notification.create({
        data: {
          userId: recipientId,
          type: 'new_message',
          title: 'New Message',
          body: `You received a new message${conversation.claim?.foundItem?.title ? ` regarding "${conversation.claim.foundItem.title}"` : ''}`,
          link: `/messages/${conversation.id}`,
        }
      });

      return msg;
    });

    revalidatePath(`/messages/${conversation.id}`);
    revalidatePath('/messages');
    
    return { success: true, conversationId: conversation.id, messageId: message.id };

  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function initializeConversation(claimId?: string, lostItemId?: string) {
  try {
    const user = await getAuthenticatedUser();
    enforceRateLimit('general', user.userId, 10, 60 * 1000); // 10 per min

    let conversation;

    if (claimId) {
      const claim = await db.claim.findUnique({
        where: { id: claimId },
        include: { foundItem: true, claimant: true }
      });

      if (!claim) return { success: false, error: 'Claim not found' };
      
      // Check if user is either claimant or finder
      if (claim.claimantId !== user.userId && claim.foundItem.userId !== user.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      // Check if conversation already exists
      conversation = await db.conversation.findUnique({
        where: { claimId: claimId }
      });

      // If not, create it
      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            claimId: claim.id,
            user1Id: claim.foundItem.userId, // Finder
            user2Id: claim.claimantId,       // Claimant
          }
        });
      }
    } else if (lostItemId) {
      const lostItem = await db.lostItem.findUnique({
        where: { id: lostItemId }
      });

      if (!lostItem) return { success: false, error: 'Lost item not found' };
      if (lostItem.userId === user.userId) return { success: false, error: 'Cannot message yourself' };

      // See if a conversation already exists between these two users for this lost item
      conversation = await db.conversation.findFirst({
        where: {
          lostItemId: lostItemId,
          OR: [
            { user1Id: lostItem.userId, user2Id: user.userId },
            { user1Id: user.userId, user2Id: lostItem.userId }
          ]
        }
      });

      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            lostItemId: lostItem.id,
            user1Id: lostItem.userId, // Owner
            user2Id: user.userId,     // Finder
          }
        });
      }
    } else {
      return { success: false, error: 'No claim ID or lost item ID provided' };
    }

    return { success: true, conversationId: conversation.id };
  } catch (error) {
    console.error('Failed to initialize conversation:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
