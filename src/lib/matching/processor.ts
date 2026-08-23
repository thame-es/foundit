import { db } from '@/lib/db';
import { calculateMatchScore } from './engine';
import { logger } from '@/lib/logger';

export async function processMatchJob(jobId: string) {
  const job = await db.matchJob.findUnique({ where: { id: jobId } });
  if (!job) return { success: false, error: 'Job not found' };

  if (job.status === 'completed') {
    return { success: true, message: 'Already processed' };
  }

  await db.matchJob.update({ where: { id: jobId }, data: { status: 'processing', attempts: job.attempts + 1 } });

  try {
    const payload = JSON.parse(job.payload);
    const { itemId, itemType } = payload; // itemType: 'lost' | 'found'

    let targetItem;
    if (itemType === 'lost') {
      targetItem = await db.lostItem.findUnique({ where: { id: itemId } });
    } else {
      targetItem = await db.foundItem.findUnique({ where: { id: itemId } });
    }

    if (!targetItem) {
      // Item was deleted or doesn't exist
      await db.matchJob.update({
        where: { id: jobId },
        data: { status: 'completed', processedAt: new Date(), error: 'Item not found' }
      });
      return { success: true };
    }

    if (targetItem.status !== 'active') {
      // We only match active items
      await db.matchJob.update({
        where: { id: jobId },
        data: { status: 'completed', processedAt: new Date(), error: 'Item not active' }
      });
      return { success: true };
    }

    let candidates: any[] = [];

    if (itemType === 'lost') {
      // Find candidate FoundItems
      candidates = await db.foundItem.findMany({
        where: {
          status: 'active',
          categoryId: targetItem.categoryId,
          userId: { not: targetItem.userId } // exclude self-matches
        }
      });
    } else {
      // Find candidate LostItems
      candidates = await db.lostItem.findMany({
        where: {
          status: 'active',
          categoryId: targetItem.categoryId,
          userId: { not: targetItem.userId } // exclude self-matches
        }
      });
    }

    let matchCount = 0;

    for (const candidate of candidates) {
      // Ensure we pass the objects in the correct order: (lostItem, foundItem)
      const lostItemObj = itemType === 'lost' ? targetItem : candidate;
      const foundItemObj = itemType === 'found' ? targetItem : candidate;

      const result = calculateMatchScore(lostItemObj as any, foundItemObj as any);

      if (result.score >= 40) {
        // Create or update PossibleMatch
        await db.possibleMatch.upsert({
          where: {
            lostItemId_foundItemId: {
              lostItemId: lostItemObj.id,
              foundItemId: foundItemObj.id
            }
          },
          create: {
            lostItemId: lostItemObj.id,
            foundItemId: foundItemObj.id,
            score: result.score,
            confidence: result.confidence,
            reasons: JSON.stringify(result.reasons),
          },
          update: {
            score: result.score,
            confidence: result.confidence,
            reasons: JSON.stringify(result.reasons),
          }
        });
        matchCount++;
      } else {
        // If it was a match before, but now isn't (e.g. updated item), we could delete it, 
        // or just let it be updated with a lower score. Let's update it if it exists so the user sees it dropped.
        const existing = await db.possibleMatch.findUnique({
          where: {
            lostItemId_foundItemId: {
              lostItemId: lostItemObj.id,
              foundItemId: foundItemObj.id
            }
          }
        });
        
        if (existing) {
          await db.possibleMatch.update({
            where: { id: existing.id },
            data: {
              score: result.score,
              confidence: result.confidence,
              reasons: JSON.stringify(result.reasons)
            }
          });
        }
      }
    }

    await db.matchJob.update({
      where: { id: jobId },
      data: { status: 'completed', processedAt: new Date() }
    });

    return { success: true, matchesFound: matchCount };

  } catch (error: any) {
    logger.error('Failed to process match job', { jobId, error: error.message });
    await db.matchJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: error.message }
    });
    return { success: false, error: error.message };
  }
}
