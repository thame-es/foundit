'use server';

import { db } from '@/lib/db';

export async function logShareEvent(actionType: string, itemType: string, itemId: string) {
  try {
    await db.shareEvent.create({
      data: {
        actionType,
        itemType,
        itemId
      }
    });
    return { success: true };
  } catch (error) {
    // Fail silently for analytics to prevent breaking the UI
    console.error('Failed to log share event:', error);
    return { success: false };
  }
}
