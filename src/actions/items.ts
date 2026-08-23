'use server';

// ===========================================
// FoundIt — Item Server Actions
// ===========================================

import { db } from '@/lib/db';
import { getAuthenticatedUser, requireLostItemOwnership, requireFoundItemOwnership, requireAdmin } from '@/lib/auth/guards';
import { createLostItemSchema, createFoundItemSchema, updateLostItemSchema, updateFoundItemSchema, CreateLostItemInput, CreateFoundItemInput, UpdateLostItemInput, UpdateFoundItemInput } from '@/lib/validations/items';
import { enforceRateLimit } from '@/lib/rate-limit';
import { checkSavedSearchesForMatch } from '@/actions/alerts';
import { appConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import { createSlug, generateId } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── Lost Items ────────────────────────────

export async function createLostItem(input: CreateLostItemInput): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await getAuthenticatedUser();
    await enforceRateLimit('general', user.userId, appConfig.rateLimit.general.max, appConfig.rateLimit.general.windowMs);

    const dbUser = await db.user.findUnique({ where: { id: user.userId }, select: { emailVerified: true } });
    if (!dbUser?.emailVerified) {
      return { success: false, error: 'You must verify your email address to post a listing.' };
    }

    const result = createLostItemSchema.safeParse(input);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors };
    }

    const data = result.data;
    const slug = createSlug(data.title);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + appConfig.listings.expiryDays);

    const item = await db.lostItem.create({
      data: {
        user: { connect: { id: user.userId } },
        slug,
        category: { connect: { slug: data.categoryId } },
        title: data.title,
        publicDescription: data.publicDescription,
        brand: data.brand,
        model: data.model,
        colour: data.colour,
        quantity: data.quantity,
        dateLost: new Date(data.dateLost),
        dateApproximate: data.dateApproximate,
        timeLost: data.timeLost,
        city: data.city,
        region: data.region,
        country: data.country,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        locationUncertain: data.locationUncertain,
        distinguishingFeatures: data.distinguishingFeatures,
        rewardOffered: data.rewardOffered,
        rewardDescription: data.rewardDescription,
        contactPreference: data.contactPreference,
        expiresAt,
        ...(data.images && data.images.length > 0 ? {
          images: {
            create: data.images.map((img: any, index: number) => ({
              filename: img.filename,
              originalName: img.originalName,
              mimeType: img.mimeType,
              size: img.size,
              width: img.width,
              height: img.height,
              thumbnailPath: img.thumbnailPath,
              mediumPath: img.mediumPath,
              order: index,
            }))
          }
        } : {})
      },
    });

    logger.info('Lost item created', { itemId: item.id, userId: user.userId });
    revalidatePath('/lost');
    revalidatePath('/dashboard/lost-items');

    // Trigger alert checking in the background (fire and forget)
    checkSavedSearchesForMatch('lost', item).catch(err => {
      console.error('Background alert check failed for lost item', err);
    });
    
    return { success: true, data: { slug: item.slug } };
  } catch (error) {
    logger.error('Create lost item error', { error: String(error) });
    return { success: false, error: 'Failed to create listing. Please try again.' };
  }
}

export async function updateLostItem(input: UpdateLostItemInput): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const result = updateLostItemSchema.safeParse(input);
    if (!result.success) return { success: false, fieldErrors: result.error.flatten().fieldErrors };
    
    const data = result.data;
    const existingItem = await db.lostItem.findUnique({ where: { id: data.id } });
    if (!existingItem) return { success: false, error: 'Item not found' };
    if (existingItem.userId !== user.userId && user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    let slug = existingItem.slug;
    if (data.title && data.title !== existingItem.title) {
      slug = createSlug(data.title);
    }

    const item = await db.lostItem.update({
      where: { id: data.id },
      data: {
        slug,
        categoryId: data.categoryId,
        title: data.title,
        publicDescription: data.publicDescription,
        brand: data.brand,
        model: data.model,
        colour: data.colour,
        quantity: data.quantity,
        dateLost: data.dateLost ? new Date(data.dateLost) : undefined,
        dateApproximate: data.dateApproximate,
        timeLost: data.timeLost,
        city: data.city,
        region: data.region,
        country: data.country,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        locationUncertain: data.locationUncertain,
        distinguishingFeatures: data.distinguishingFeatures,
        contactPreference: data.contactPreference,
      },
    });

    if (data.images && data.images.length > 0) {
      await db.itemImage.deleteMany({ where: { lostItemId: item.id } });
      await db.itemImage.createMany({
        data: data.images.map((img: any, index: number) => ({
          lostItemId: item.id,
          filename: img.filename,
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
          width: img.width,
          height: img.height,
          thumbnailPath: img.thumbnailPath,
          mediumPath: img.mediumPath,
          order: index,
        }))
      });
    }

    logger.info('Lost item updated', { itemId: item.id, userId: user.userId });
    revalidatePath('/lost');
    revalidatePath(`/lost/${slug}`);
    revalidatePath('/dashboard/my-listings');
    
    return { success: true, data: { slug: item.slug } };
  } catch (error) {
    logger.error('Update lost item error', { error: String(error) });
    return { success: false, error: 'Failed to update listing.' };
  }
}

export async function updateLostItemStatus(itemId: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireLostItemOwnership(itemId);
    
    const validStatuses = ['active', 'possible_match', 'recovered', 'hidden'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status' };
    }

    await db.lostItem.update({
      where: { id: itemId },
      data: { status },
    });

    logger.info('Lost item status updated', { itemId, status, userId: user.userId });
    revalidatePath(`/lost`);
    revalidatePath(`/dashboard/lost-items`);
    return { success: true };
  } catch (error) {
    logger.error('Update lost item status error', { error: String(error) });
    return { success: false, error: 'Failed to update status.' };
  }
}

export async function deleteLostItem(itemId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    
    // Verify ownership or admin
    const item = await db.lostItem.findUnique({ where: { id: itemId } });
    if (!item) return { success: false, error: 'Item not found' };
    
    if (item.userId !== user.userId && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.lostItem.delete({ where: { id: itemId } });
    logger.info('Lost item deleted', { itemId, userId: user.userId });
    
    revalidatePath('/lost');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Delete lost item error', { error: String(error) });
    return { success: false, error: 'Failed to delete listing.' };
  }
}

// ─── Found Items ───────────────────────────

export async function createFoundItem(input: CreateFoundItemInput): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await getAuthenticatedUser();
    await enforceRateLimit('general', user.userId, appConfig.rateLimit.general.max, appConfig.rateLimit.general.windowMs);

    const dbUser = await db.user.findUnique({ where: { id: user.userId }, select: { emailVerified: true } });
    if (!dbUser?.emailVerified) {
      return { success: false, error: 'You must verify your email address to post a listing.' };
    }

    const result = createFoundItemSchema.safeParse(input);
    if (!result.success) {
      return { success: false, fieldErrors: result.error.flatten().fieldErrors };
    }

    const data = result.data;
    const slug = createSlug(data.title);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + appConfig.listings.expiryDays);

    const item = await db.foundItem.create({
      data: {
        user: { connect: { id: user.userId } },
        slug,
        category: { connect: { slug: data.categoryId } },
        title: data.title,
        publicDescription: data.publicDescription,
        brand: data.brand,
        model: data.model,
        colour: data.colour,
        dateFound: new Date(data.dateFound),
        dateApproximate: data.dateApproximate,
        timeFound: data.timeFound,
        city: data.city,
        region: data.region,
        country: data.country,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        privateVerificationDetail: data.privateVerificationDetail,
        expiresAt,
        ...(data.images && data.images.length > 0 ? {
          images: {
            create: data.images.map((img: any, index: number) => ({
              filename: img.filename,
              originalName: img.originalName,
              mimeType: img.mimeType,
              size: img.size,
              width: img.width,
              height: img.height,
              thumbnailPath: img.thumbnailPath,
              mediumPath: img.mediumPath,
              order: index,
            }))
          }
        } : {})
      },
    });

    logger.info('Found item created', { itemId: item.id, userId: user.userId });
    revalidatePath('/found');
    revalidatePath('/dashboard/found-items');
    
    // Trigger alert checking in the background (fire and forget)
    checkSavedSearchesForMatch('found', item).catch(err => {
      console.error('Background alert check failed for found item', err);
    });

    return { success: true, data: { slug: item.slug } };
  } catch (error) {
    logger.error('Create found item error', { error: String(error) });
    return { success: false, error: 'Failed to create listing. Please try again.' };
  }
}

export async function updateFoundItem(input: UpdateFoundItemInput): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const result = updateFoundItemSchema.safeParse(input);
    if (!result.success) return { success: false, fieldErrors: result.error.flatten().fieldErrors };
    
    const data = result.data;
    const existingItem = await db.foundItem.findUnique({ where: { id: data.id } });
    if (!existingItem) return { success: false, error: 'Item not found' };
    if (existingItem.userId !== user.userId && user.role !== 'admin') return { success: false, error: 'Unauthorized' };

    let slug = existingItem.slug;
    if (data.title && data.title !== existingItem.title) {
      slug = createSlug(data.title);
    }

    const item = await db.foundItem.update({
      where: { id: data.id },
      data: {
        slug,
        categoryId: data.categoryId,
        title: data.title,
        publicDescription: data.publicDescription,
        brand: data.brand,
        model: data.model,
        colour: data.colour,
        dateFound: data.dateFound ? new Date(data.dateFound) : undefined,
        dateApproximate: data.dateApproximate,
        timeFound: data.timeFound,
        city: data.city,
        region: data.region,
        country: data.country,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        privateVerificationDetail: data.privateVerificationDetail,
      },
    });

    if (data.images && data.images.length > 0) {
      await db.itemImage.deleteMany({ where: { foundItemId: item.id } });
      await db.itemImage.createMany({
        data: data.images.map((img: any, index: number) => ({
          foundItemId: item.id,
          filename: img.filename,
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
          width: img.width,
          height: img.height,
          thumbnailPath: img.thumbnailPath,
          mediumPath: img.mediumPath,
          order: index,
        }))
      });
    }

    logger.info('Found item updated', { itemId: item.id, userId: user.userId });
    revalidatePath('/found');
    revalidatePath(`/found/${slug}`);
    revalidatePath('/dashboard/my-listings');
    
    return { success: true, data: { slug: item.slug } };
  } catch (error) {
    logger.error('Update found item error', { error: String(error) });
    return { success: false, error: 'Failed to update listing.' };
  }
}

export async function updateFoundItemStatus(itemId: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireFoundItemOwnership(itemId);
    
    const validStatuses = ['active', 'hidden', 'returned'];
    // 'claim_pending' and 'claimed' are managed by the claim state machine
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status' };
    }

    await db.foundItem.update({
      where: { id: itemId },
      data: { status },
    });

    logger.info('Found item status updated', { itemId, status, userId: user.userId });
    revalidatePath(`/found`);
    revalidatePath(`/dashboard/found-items`);
    return { success: true };
  } catch (error) {
    logger.error('Update found item status error', { error: String(error) });
    return { success: false, error: 'Failed to update status.' };
  }
}

export async function deleteFoundItem(itemId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    
    // Verify ownership or admin
    const item = await db.foundItem.findUnique({ where: { id: itemId } });
    if (!item) return { success: false, error: 'Item not found' };
    
    if (item.userId !== user.userId && user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.foundItem.delete({ where: { id: itemId } });
    logger.info('Found item deleted', { itemId, userId: user.userId });
    
    revalidatePath('/found');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    logger.error('Delete found item error', { error: String(error) });
    return { success: false, error: 'Failed to delete listing.' };
  }
}

// ─── Admin Actions ─────────────────────────

export async function adminDeleteLostItem(itemId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    
    await db.lostItem.delete({
      where: { id: itemId },
    });

    await db.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'admin_delete_lost_item',
        target: `listing:${itemId}`,
      }
    });

    logger.warn('Admin deleted lost item', { itemId, adminId: admin.userId });
    revalidatePath('/admin/items');
    return { success: true };
  } catch (error) {
    logger.error('Admin delete lost item error', { error: String(error) });
    return { success: false, error: 'Failed to delete item.' };
  }
}

export async function adminDeleteFoundItem(itemId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    
    await db.foundItem.delete({
      where: { id: itemId },
    });

    await db.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'admin_delete_found_item',
        target: `listing:${itemId}`,
      }
    });

    logger.warn('Admin deleted found item', { itemId, adminId: admin.userId });
    revalidatePath('/admin/items');
    return { success: true };
  } catch (error) {
    logger.error('Admin delete found item error', { error: String(error) });
    return { success: false, error: 'Failed to delete item.' };
  }
}
