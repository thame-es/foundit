// ===========================================
// FoundIt — Rate Limiting
// ===========================================
// In-memory rate limiter per IP address.
// ===========================================

import { db } from '@/lib/db';

/**
 * Check rate limit for a given key and IP
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  category: string,
  identifier: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${category}:${identifier}`;
  const now = new Date();
  const resetAtTime = new Date(now.getTime() + windowMs);

  try {
    // We use an atomic upsert to increment the count
    const record = await db.rateLimit.upsert({
      where: { key },
      update: {
        count: { increment: 1 },
      },
      create: {
        key,
        count: 1,
        resetAt: resetAtTime,
      },
    });

    // If the record exists but the window has expired, reset it
    if (now > record.resetAt) {
      await db.rateLimit.update({
        where: { key },
        data: {
          count: 1,
          resetAt: resetAtTime,
        },
      });
      return { allowed: true, remaining: max - 1, resetAt: resetAtTime.getTime() };
    }

    if (record.count > max) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt.getTime() };
    }

    return { allowed: true, remaining: max - record.count, resetAt: record.resetAt.getTime() };
  } catch (error) {
    // Fallback if DB fails: allow request to avoid breaking auth completely, 
    // but log the error
    console.error('Rate limit database error', error);
    return { allowed: true, remaining: 1, resetAt: resetAtTime.getTime() };
  }
}

/**
 * Rate limit helper for server actions
 * Throws error if rate limited
 */
export async function enforceRateLimit(
  category: string,
  identifier: string,
  max: number,
  windowMs: number
): Promise<void> {
  const result = await checkRateLimit(category, identifier, max, windowMs);
  if (!result.allowed) {
    throw new Error('Too many requests. Please try again later.');
  }
}

// Periodic cleanup of expired entries (every 5 minutes)
// Clean up function can be run via cron or background job in a real deployment
export async function cleanupRateLimits() {
  await db.rateLimit.deleteMany({
    where: {
      resetAt: { lt: new Date() },
    },
  });
}
