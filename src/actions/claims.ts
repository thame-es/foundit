'use server';

// ===========================================
// FoundIt — Claims Server Actions
// ===========================================

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { enforceRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { claimStates, foundItemStatuses, lostItemStatuses } from '@/lib/config';

const submitClaimSchema = z.object({
  foundItemId: z.string(),
  verificationProof: z.string().min(10, 'Please provide detailed proof of ownership').max(1000),
  // images handled separately
});

export async function submitClaim(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    await enforceRateLimit('general', user.userId, 10, 60 * 60 * 1000); // 10 claims per hour

    const dbUser = await db.user.findUnique({ where: { id: user.userId }, select: { emailVerified: true } });
    if (!dbUser?.emailVerified) {
      return { success: false, error: 'You must verify your email address before submitting a claim.' };
    }

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
      where: { claimantId: user.userId, foundItemId, status: { notIn: [claimStates.REJECTED, claimStates.CANCELLED] } }
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
          status: claimStates.SUBMITTED,
        }
      });

      // Update Found Item status
      await tx.foundItem.update({
        where: { id: foundItemId },
        data: { status: foundItemStatuses.CLAIM_PENDING }
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
    if (claim.status !== claimStates.SUBMITTED && claim.status !== claimStates.UNDER_REVIEW) return { success: false, error: 'Claim is no longer pending review' };

    await db.$transaction(async (tx) => {
      // Approve this claim and move to COLLECTION_ARRANGED directly
      await tx.claim.update({
        where: { id: claimId },
        data: { status: claimStates.COLLECTION_ARRANGED }
      });

      // Reject all other pending claims for this item
      await tx.claim.updateMany({
        where: { foundItemId: claim.foundItemId, id: { not: claimId }, status: { in: [claimStates.SUBMITTED, claimStates.UNDER_REVIEW] } },
        data: { status: claimStates.REJECTED, adminNotes: 'Another claim was approved' }
      });

      await tx.auditLog.create({
        data: { userId: user.userId, action: 'claim_approved', target: `claim:${claimId}` }
      });

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
        data: { status: claimStates.REJECTED, adminNotes: reason || 'Details did not match' }
      });

      // Check if any other claims exist. If not, revert item status
      const otherPending = await tx.claim.count({
        where: { foundItemId: claim.foundItemId, status: { in: [claimStates.SUBMITTED, claimStates.UNDER_REVIEW] } }
      });

      if (otherPending === 0) {
        await tx.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: foundItemStatuses.ACTIVE }
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

export async function confirmHandover(claimId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    const claim = await db.claim.findUnique({
      where: { id: claimId },
      include: { foundItem: true }
    });

    if (!claim) return { success: false, error: 'Claim not found' };
    
    const isFinder = claim.foundItem.userId === user.userId;
    const isClaimant = claim.claimantId === user.userId;

    if (!isFinder && !isClaimant) {
      return { success: false, error: 'Unauthorized' };
    }

    // Must be in COLLECTION_ARRANGED state
    if (claim.status !== claimStates.COLLECTION_ARRANGED) {
      return { success: false, error: 'Claim is not in handover state' };
    }

    await db.$transaction(async (tx) => {
      const updateData: any = {};
      
      if (isFinder) {
        updateData.returnConfirmedByFinder = true;
      } else if (isClaimant) {
        updateData.returnConfirmedByClaimant = true;
      }

      // Check if this action makes both true
      const willBeConfirmedByFinder = isFinder ? true : claim.returnConfirmedByFinder;
      const willBeConfirmedByClaimant = isClaimant ? true : claim.returnConfirmedByClaimant;

      if (willBeConfirmedByFinder && willBeConfirmedByClaimant) {
        updateData.status = claimStates.RETURNED; // Mutually confirmed!
        
        // Update Found Item to returned
        await tx.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: foundItemStatuses.RETURNED }
        });
        
        // If the claimant had a linked Lost Item, mark it recovered
        // We find the linked lost item by finding a conversation or just searching by claimantId
        const linkedLostItem = await tx.lostItem.findFirst({
          where: { userId: claim.claimantId, status: lostItemStatuses.ACTIVE }
        });
        if (linkedLostItem) {
          await tx.lostItem.update({
            where: { id: linkedLostItem.id },
            data: { status: lostItemStatuses.RECOVERED }
          });
        }
      }

      await tx.claim.update({
        where: { id: claimId },
        data: updateData
      });

      // Log the confirmation
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: willBeConfirmedByFinder && willBeConfirmedByClaimant ? 'handover_completed' : 'handover_party_confirmed',
          target: `claim:${claimId}`
        }
      });
      
      // Notify the other party
      const notifyUserId = isFinder ? claim.claimantId : claim.foundItem.userId;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: 'claim_update',
          title: willBeConfirmedByFinder && willBeConfirmedByClaimant ? 'Return Completed!' : 'Handover Confirmed',
          body: willBeConfirmedByFinder && willBeConfirmedByClaimant 
            ? 'Both parties have confirmed the handover. The return is complete!' 
            : 'The other party has confirmed the handover. Please confirm once you are ready.',
          link: `/dashboard/claims`,
        }
      });
    });

    revalidatePath('/dashboard/claims');
    return { success: true };
  } catch (error) {
    console.error('Confirm handover error:', error);
    return { success: false, error: 'Failed to confirm handover' };
  }
}

