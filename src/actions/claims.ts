'use server';

// ===========================================
// FoundIt — Claims Server Actions
// ===========================================

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { enforceRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const submitClaimSchema = z.object({
  foundItemId: z.string(),
  verificationProof: z.string().min(10, 'Please provide detailed proof of ownership').max(1000),
  // images handled separately
});

export async function submitClaim(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    enforceRateLimit('general', user.userId, 10, 60 * 60 * 1000); // 10 claims per hour

    const foundItemId = formData.get('foundItemId') as string;
    const verificationProof = formData.get('verificationProof') as string;

    const result = submitClaimSchema.safeParse({ foundItemId, verificationProof });
    if (!result.success) {
      return { success: false, error: 'Invalid claim data provided' };
    }

    // Ensure item exists and is active
    const item = await db.foundItem.findUnique({ where: { id: foundItemId } });
    if (!item || item.status !== 'active') {
      return { success: false, error: 'This item is no longer available to claim.' };
    }

    // Ensure user isn't claiming their own found item
    if (item.userId === user.userId) {
      return { success: false, error: 'You cannot claim an item you reported as found.' };
    }

    // Check if user already has an active claim for this item
    const existingClaim = await db.claim.findFirst({
      where: { claimantId: user.userId, foundItemId, status: { in: ['pending', 'approved'] } }
    });
    
    if (existingClaim) {
      return { success: false, error: 'You already have an active claim for this item.' };
    }

    // Create Claim Transaction
    const claim = await db.$transaction(async (tx) => {
      const newClaim = await tx.claim.create({
        data: {
          claimantId: user.userId,
          foundItemId,
          reasonForClaim: verificationProof,
          description: verificationProof,
          status: 'pending',
        }
      });

      // Update Found Item status
      await tx.foundItem.update({
        where: { id: foundItemId },
        data: { status: 'claim_pending' }
      });

      // Create notification for Finder
      await tx.notification.create({
        data: {
          userId: item.userId,
          type: 'claim_update',
          title: 'New Claim Received',
          body: `Someone has submitted a claim for "${item.title}". Please review it.`,
          link: `/dashboard/claims`,
        }
      });

      return newClaim;
    });

    revalidatePath(`/found/${item.slug}`);
    revalidatePath('/dashboard/claims');
    return { success: true, claimId: claim.id };

  } catch (error) {
    console.error('Submit claim error:', error);
    return { success: false, error: 'An unexpected error occurred while submitting the claim.' };
  }
}

export async function approveClaim(claimId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    const claim = await db.claim.findUnique({
      where: { id: claimId },
      include: { foundItem: true }
    });

    if (!claim) return { success: false, error: 'Claim not found' };
    if (claim.foundItem.userId !== user.userId) return { success: false, error: 'Unauthorized' };
    if (claim.status !== 'pending') return { success: false, error: 'Claim is no longer pending' };

    await db.$transaction(async (tx) => {
      // Approve this claim
      await tx.claim.update({
        where: { id: claimId },
        data: { status: 'approved' }
      });

      // Reject all other pending claims for this item
      await tx.claim.updateMany({
        where: { foundItemId: claim.foundItemId, id: { not: claimId }, status: 'pending' },
        data: { status: 'rejected', adminNotes: 'Another claim was approved' }
      });

      // We DON'T set the item to 'returned' yet. Approved claim just means verification passed
      // and they can now communicate to arrange return.

      // Notify Claimant
      await tx.notification.create({
        data: {
          userId: claim.claimantId,
          type: 'claim_update',
          title: 'Claim Approved!',
          body: `Your claim for "${claim.foundItem.title}" was approved. You can now message the finder.`,
          link: `/dashboard/claims`,
        }
      });
    });

    revalidatePath('/dashboard/claims');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to approve claim' };
  }
}

export async function rejectClaim(claimId: string, reason?: string) {
  try {
    const user = await getAuthenticatedUser();
    
    const claim = await db.claim.findUnique({
      where: { id: claimId },
      include: { foundItem: true }
    });

    if (!claim) return { success: false, error: 'Claim not found' };
    if (claim.foundItem.userId !== user.userId) return { success: false, error: 'Unauthorized' };

    await db.$transaction(async (tx) => {
      await tx.claim.update({
        where: { id: claimId },
        data: { status: 'rejected', adminNotes: reason || 'Details did not match' }
      });

      // Check if any other claims exist. If not, revert item status
      const otherPending = await tx.claim.count({
        where: { foundItemId: claim.foundItemId, status: 'pending' }
      });

      if (otherPending === 0) {
        await tx.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: 'active' }
        });
      }

      await tx.notification.create({
        data: {
          userId: claim.claimantId,
          type: 'claim_update',
          title: 'Claim Rejected',
          body: `Your claim for "${claim.foundItem.title}" was rejected. ${reason ? `Reason: ${reason}` : ''}`,
          link: `/dashboard/claims`,
        }
      });
    });

    revalidatePath('/dashboard/claims');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to reject claim' };
  }
}
