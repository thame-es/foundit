'use server';

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';

export interface CreateSavedSearchInput {
  name: string;
  query?: string;
  type?: 'lost' | 'found' | 'all';
  categoryId?: string;
  brand?: string;
  colour?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  radius?: number;
  datePreference?: string;
  alertsEnabled?: boolean;
}

export async function createSavedSearch(input: CreateSavedSearchInput) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const searchCount = await db.savedSearch.count({ where: { userId: user.userId } });
    if (searchCount >= 20) return { success: false, error: 'Maximum saved searches reached.' };

    const newSearch = await db.savedSearch.create({
      data: {
        userId: user.userId,
        name: input.name,
        query: input.query || null,
        type: input.type || 'all',
        categoryId: input.categoryId || null,
        brand: input.brand || null,
        colour: input.colour || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        locationName: input.locationName || null,
        radius: input.radius || null,
        datePreference: input.datePreference || 'any',
        alertsEnabled: input.alertsEnabled !== false,
      }
    });

    revalidatePath('/dashboard/saved-searches');
    return { success: true, savedSearch: newSearch };
  } catch (error: any) {
    console.error('Error creating saved search:', error);
    return { success: false, error: error.message || 'Failed to save search' };
  }
}

export async function getSavedSearches() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Unauthorized', searches: [] };

    const searches = await db.savedSearch.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, searches };
  } catch (error) {
    return { success: false, error: 'Failed to fetch saved searches', searches: [] };
  }
}

export async function deleteSavedSearch(id: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    await db.savedSearch.delete({
      where: { id, userId: user.userId } // ensuring user owns it
    });

    revalidatePath('/dashboard/saved-searches');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete saved search' };
  }
}

export async function toggleSavedSearchAlert(id: string, enabled: boolean) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    await db.savedSearch.update({
      where: { id, userId: user.userId },
      data: { alertsEnabled: enabled }
    });

    revalidatePath('/dashboard/saved-searches');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update alert preference' };
  }
}
