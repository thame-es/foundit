'use server';

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { sendVerificationEmail } from '@/lib/services/email';
import { enforceRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function resendVerificationEmail() {
  try {
    const session = await getAuthenticatedUser();
    
    // Rate limit: 3 resends per hour
    enforceRateLimit('general', `resend_${session.userId}`, 3, 60 * 60 * 1000);

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { emailVerified: true, email: true, displayName: true }
    });

    if (!user || user.emailVerified) {
      return { success: false, error: 'User already verified or not found' };
    }

    // Delete existing tokens
    await db.verificationToken.deleteMany({
      where: { userId: session.userId }
    });

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    await db.verificationToken.create({
      data: {
        userId: session.userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    await sendVerificationEmail(user.email, user.displayName, token);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Please wait before requesting another verification email' };
    }
    console.error('Resend verification error', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
}
