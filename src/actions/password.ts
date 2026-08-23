'use server';

import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '@/lib/validations/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '@/lib/services/email';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ActionResult } from './auth';

// 1. requestPasswordReset
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  try {
    const rawEmail = formData.get('email') as string;
    
    // Validate input
    const result = forgotPasswordSchema.safeParse({ email: rawEmail });
    if (!result.success) {
      return { success: false, error: 'Invalid email address.' };
    }
    
    const email = result.data.email;
    
    // Rate limits (per email)
    await enforceRateLimit('auth', `forgot_password_${email}`, 3, 60 * 60 * 1000);
    
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, status: true, displayName: true }
    });

    // Generic response regardless of existence/status
    const genericResponse = { 
      success: true, 
      message: 'If an eligible FoundIt account exists for that email, we have sent a password reset link.' 
    };

    if (!user) {
      logger.info('Password reset requested for non-existent email', { email });
      return genericResponse;
    }

    if (user.status !== 'active') {
      logger.info('Password reset requested for inactive account', { userId: user.id });
      return genericResponse;
    }

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate previous active tokens
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() } // Mark as used/invalidated
    });

    // Store token hash
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // Send email with plaintext token
    const emailResult = await sendPasswordResetEmail(email, user.displayName, token);
    
    if (emailResult?.success === false && emailResult.reason !== 'temporary_error') {
      logger.warn('Failed to send password reset email (permanent/not_configured)', { userId: user.id });
    }

    return genericResponse;

  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }
    logger.error('Password reset request error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// 2. resetPassword
export async function resetPassword(formData: FormData): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('foundit_reset_token')?.value;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    const genericError = 'This password reset link is invalid or has expired. Please request a new link.';

    if (!token || typeof token !== 'string') {
      return { success: false, error: genericError };
    }

    const result = resetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Rate limiting for submissions
    await enforceRateLimit('auth', 'reset_password_submit', 10, 15 * 60 * 1000);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      return { success: false, error: genericError };
    }

    // Ensure it's active
    if (resetRecord.user.status !== 'active') {
      return { success: false, error: genericError };
    }

    const newPasswordHash = await hashPassword(password);

    // Atomic transaction
    await db.$transaction(async (tx) => {
      // Mark token used
      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() }
      });

      // Update password & increment sessionVersion to revoke all sessions
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash: newPasswordHash,
          sessionVersion: { increment: 1 }
        }
      });

      // Invalidate any other unused tokens for this user
      await tx.passwordResetToken.updateMany({
        where: { userId: resetRecord.userId, usedAt: null, id: { not: resetRecord.id } },
        data: { usedAt: new Date() }
      });
      
      // Audit log
      await tx.auditLog.create({
        data: {
          userId: resetRecord.userId,
          action: 'PASSWORD_RESET',
          details: 'Password was reset using email token'
        }
      });
    });

    // Destroy current session (just in case they are logged in)
    await destroySession();
    
    // Clear the reset cookie
    cookieStore.delete('foundit_reset_token');

    // Send notification email
    await sendPasswordChangedEmail(resetRecord.user.email, resetRecord.user.displayName);

    logger.info('Password successfully reset', { userId: resetRecord.userId });

    return { success: true };

  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }
    logger.error('Password reset error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// 3. changePassword (Authenticated)
export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Authentication required.' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const result = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await enforceRateLimit('auth', `change_password_${currentUser.userId}`, 5, 15 * 60 * 1000);

    const user = await db.user.findUnique({
      where: { id: currentUser.userId },
      select: { passwordHash: true, status: true, email: true, displayName: true }
    });

    if (!user || user.status !== 'active') {
      return { success: false, error: 'Account not active.' };
    }

    if (!user.passwordHash) {
      // Google-only account without password
      return { success: false, error: 'You currently sign in with Google. Manage your password through your Google account, or use the "Forgot Password" flow to create a local password.' };
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      // Rate limit specifically for failed current password
      await enforceRateLimit('auth', `failed_password_${currentUser.userId}`, 5, 60 * 60 * 1000);
      return { success: false, fieldErrors: { currentPassword: ['Incorrect current password.'] } };
    }

    if (currentPassword === newPassword) {
      return { success: false, fieldErrors: { newPassword: ['New password must be different from current password.'] } };
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Atomic transaction
    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: currentUser.userId },
        data: {
          passwordHash: newPasswordHash,
          sessionVersion: { increment: 1 } // Revokes all old sessions
        }
      }),
      db.auditLog.create({
        data: {
          userId: currentUser.userId,
          action: 'PASSWORD_CHANGED',
          details: 'Password was changed via settings'
        }
      })
    ]);

    // Issue a fresh authenticated session (session rotation)
    await createSession({
      id: currentUser.userId,
      role: currentUser.role,
      displayName: currentUser.displayName,
      email: currentUser.email,
      avatar: currentUser.avatar,
      sessionVersion: updatedUser.sessionVersion
    });

    // Send notification email
    await sendPasswordChangedEmail(user.email, user.displayName);

    logger.info('Password successfully changed from settings', { userId: currentUser.userId });

    return { success: true };

  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }
    logger.error('Change password error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
