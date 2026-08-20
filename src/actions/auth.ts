'use server';

// ===========================================
// FoundIt — Auth Server Actions
// ===========================================
// Registration, login, logout, password reset.
// All validation server-side via Zod.
// ===========================================

import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema } from '@/lib/validations/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { appConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import { generateToken } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// Standard action response type
export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function register(formData: FormData): Promise<ActionResult> {
  try {
    enforceRateLimit('auth', 'register', appConfig.rateLimit.auth.max, appConfig.rateLimit.auth.windowMs);

    const raw = {
      displayName: formData.get('displayName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      acceptTerms: formData.get('acceptTerms') === 'on' || formData.get('acceptTerms') === 'true',
    };

    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { displayName, email, password } = result.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        fieldErrors: { email: ['An account with this email already exists'] },
      };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        displayName,
        email,
        passwordHash,
      },
    });

    // Create session
    await createSession(user);

    logger.info('User registered', { userId: user.id, email });
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many registration attempts. Please try again later.' };
    }
    logger.error('Registration error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function login(formData: FormData): Promise<ActionResult> {
  try {
    enforceRateLimit('auth', 'login', appConfig.rateLimit.auth.max, appConfig.rateLimit.auth.windowMs);

    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        displayName: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!user) {
      logger.security('Failed login - user not found', { email });
      return { success: false, error: 'Invalid email or password.' };
    }

    // Check if user is suspended/deactivated
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact support.' };
    }
    if (user.status === 'deactivated') {
      return { success: false, error: 'This account has been deactivated.' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logger.security('Failed login - invalid password', { email });
      return { success: false, error: 'Invalid email or password.' };
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    await createSession(user);

    logger.info('User logged in', { userId: user.id });
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }
    logger.error('Login error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/');
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  try {
    enforceRateLimit('auth', 'forgot-password', appConfig.rateLimit.auth.max, appConfig.rateLimit.auth.windowMs);

    const raw = { email: formData.get('email') as string };
    const result = forgotPasswordSchema.safeParse(raw);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const { email } = result.data;
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Generate token
    const token = await generateToken(32);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Invalidate existing tokens
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create reset token (expires in 1 hour)
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // TODO: Send email with reset link when SMTP is configured
    // For now, log the token in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Password reset token (dev only)', { token, resetUrl: `${appConfig.url}/reset-password?token=${token}` });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }
    logger.error('Forgot password error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      token: formData.get('token') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const result = resetPasswordSchema.safeParse(raw);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const { token, password } = result.data;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, status: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return { success: false, error: 'This reset link is invalid or has expired. Please request a new one.' };
    }

    // Hash new password and update
    const passwordHash = await hashPassword(password);
    await db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    logger.info('Password reset successful', { userId: resetToken.userId });

    return { success: true };
  } catch (error) {
    logger.error('Reset password error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Authentication required.' };

    const raw = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const result = changePasswordSchema.safeParse(raw);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.userId },
      select: { passwordHash: true },
    });

    if (!user) return { success: false, error: 'User not found.' };

    const isValid = await verifyPassword(result.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, fieldErrors: { currentPassword: ['Current password is incorrect'] } };
    }

    const passwordHash = await hashPassword(result.data.newPassword);
    await db.user.update({
      where: { id: currentUser.userId },
      data: { passwordHash },
    });

    logger.info('Password changed', { userId: currentUser.userId });
    return { success: true };
  } catch (error) {
    logger.error('Change password error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Authentication required.' };

    const raw = {
      displayName: formData.get('displayName') as string,
      bio: (formData.get('bio') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    };

    const result = updateProfileSchema.safeParse(raw);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
    }

    await db.user.update({
      where: { id: currentUser.userId },
      data: result.data,
    });

    // Update session with new display name
    await createSession({
      id: currentUser.userId,
      role: currentUser.role,
      displayName: result.data.displayName,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Update profile error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Authentication required.' };

    const userId = currentUser.userId;

    // Delete all user-related data in the correct order (dependencies first)

    // 1. Delete images attached to user's lost and found items
    const lostItems = await db.lostItem.findMany({ where: { userId }, select: { id: true } });
    const foundItems = await db.foundItem.findMany({ where: { userId }, select: { id: true } });
    const lostItemIds = lostItems.map(i => i.id);
    const foundItemIds = foundItems.map(i => i.id);

    if (lostItemIds.length > 0) {
      await db.itemImage.deleteMany({ where: { lostItemId: { in: lostItemIds } } });
    }
    if (foundItemIds.length > 0) {
      await db.itemImage.deleteMany({ where: { foundItemId: { in: foundItemIds } } });
    }

    // 2. Delete claims made by the user or on user's items
    await db.claim.deleteMany({ where: { claimantId: userId } });
    if (foundItemIds.length > 0) {
      await db.claim.deleteMany({ where: { foundItemId: { in: foundItemIds } } });
    }

    // 3. Delete messages in user's conversations
    const conversations = await db.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { id: true },
    });
    const conversationIds = conversations.map(c => c.id);
    if (conversationIds.length > 0) {
      await db.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
      await db.conversation.deleteMany({ where: { id: { in: conversationIds } } });
    }

    // 4. Delete notifications, saved items, reports, blocks
    await db.notification.deleteMany({ where: { userId } });
    await db.savedItem.deleteMany({ where: { userId } });
    await db.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] } });
    await db.userBlock.deleteMany({ where: { OR: [{ blockingUserId: userId }, { blockedUserId: userId }] } });
    await db.auditLog.deleteMany({ where: { userId } });
    await db.contactSubmission.deleteMany({ where: { userId } });

    // 5. Delete user's lost and found items
    await db.lostItem.deleteMany({ where: { userId } });
    await db.foundItem.deleteMany({ where: { userId } });

    // 6. Delete auth-related data
    await db.session.deleteMany({ where: { userId } });
    await db.passwordResetToken.deleteMany({ where: { userId } });

    // 7. Delete business account if any
    await db.businessAccount.deleteMany({ where: { userId } });

    // 8. Finally, delete the user
    await db.user.delete({ where: { id: userId } });

    await destroySession();
    logger.info('Account permanently deleted', { userId });
    
    return { success: true };
  } catch (error) {
    logger.error('Delete account error', { error: String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
