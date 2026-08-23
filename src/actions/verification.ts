'use server';

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
// sendVerificationEmail removed
import { enforceRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function resendVerificationEmail() {
  try {
    const session = await getAuthenticatedUser();
    
    // Rate limit: 3 resends per hour
    await enforceRateLimit('general', `resend_${session.userId}`, 3, 60 * 60 * 1000);

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { emailVerified: true, email: true, displayName: true }
    });

    if (!user || user.emailVerified) {
      return { success: false, error: 'User already verified or not found' };
    }

    // Delete existing tokens
    await db.otpChallenge.updateMany({
      where: { userId: session.userId, purpose: 'registration_verification', consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const { generateOtp, hashOtp } = await import('@/lib/auth/otp');
    const { sendOtpVerificationEmail } = await import('@/lib/services/email');

    // Create new token
    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.otpChallenge.create({
      data: {
        userId: session.userId,
        email: user.email,
        purpose: 'registration_verification',
        codeHash,
        expiresAt,
        locale: 'en'
      }
    });

    await sendOtpVerificationEmail(user.email, user.displayName, otp);

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Please wait before requesting another verification email' };
    }
    console.error('Resend verification error', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
}
