'use server';

import { db } from '@/lib/db';
import { sendSearchAlertEmail } from '@/lib/services/email';
import { logger } from '@/lib/logger';
import { calculateDistance } from '@/lib/geo';

interface BaseItem {
  id: string;
  userId: string;
  title: string;
  slug: string;
  categoryId: string;
  brand?: string | null;
  colour?: string | null;
  city?: string | null;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Checks all active saved searches and generates notifications/emails for matches.
 * Note: Runs asynchronously, do not await this in the main request thread if possible.
 */
export async function checkSavedSearchesForMatch(itemType: 'lost' | 'found', item: BaseItem) {
  try {
    // 1. Fetch enabled searches for this type (or 'all')
    const searches = await db.savedSearch.findMany({
      where: {
        alertsEnabled: true,
        userId: { not: item.userId }, // Don't notify the person who created the item
        OR: [
          { type: 'all' },
          { type: itemType }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            notificationPrefs: true,
          }
        }
      }
    });

    if (!searches.length) return;

    const matchesToNotify: typeof searches = [];

    // 2. Evaluate each search against the item
    for (const search of searches) {
      let isMatch = true;

      // Category check
      if (search.categoryId && search.categoryId !== item.categoryId) {
        isMatch = false;
        continue;
      }

      // Brand check
      if (search.brand && item.brand) {
        if (!item.brand.toLowerCase().includes(search.brand.toLowerCase())) {
          isMatch = false;
          continue;
        }
      } else if (search.brand && !item.brand) {
        isMatch = false;
        continue;
      }

      // Colour check
      if (search.colour && item.colour) {
        if (!item.colour.toLowerCase().includes(search.colour.toLowerCase())) {
          isMatch = false;
          continue;
        }
      } else if (search.colour && !item.colour) {
        isMatch = false;
        continue;
      }

      // Query check (Text search in title)
      if (search.query) {
        if (!item.title.toLowerCase().includes(search.query.toLowerCase())) {
          isMatch = false;
          continue;
        }
      }

      // Location / Radius check
      if (search.latitude && search.longitude && search.radius) {
        if (item.latitude && item.longitude) {
          const distance = calculateDistance(
            search.latitude, search.longitude,
            item.latitude, item.longitude
          );
          if (distance > search.radius) {
            isMatch = false;
            continue;
          }
        } else {
          // The search requires a location, but the item has none.
          isMatch = false;
          continue;
        }
      }

      if (isMatch) {
        matchesToNotify.push(search);
      }
    }

    // 3. Dispatch notifications and emails
    const itemUrl = `/${itemType}/${item.slug}`;
    const locationString = [item.area, item.city].filter(Boolean).join(', ');

    for (const search of matchesToNotify) {
      try {
        // Use a transaction to ensure we only notify once
        await db.$transaction(async (tx) => {
          const existing = await tx.savedSearchAlertDelivery.findUnique({
            where: {
              savedSearchId_itemType_itemId: {
                savedSearchId: search.id,
                itemType: itemType,
                itemId: item.id
              }
            }
          });

          if (existing) {
            // Already delivered/notified
            return;
          }

          // Create delivery record
          const delivery = await tx.savedSearchAlertDelivery.create({
            data: {
              savedSearchId: search.id,
              itemType: itemType,
              itemId: item.id,
              emailSent: false
            }
          });

          // Create in-app notification
          await tx.notification.create({
            data: {
              userId: search.userId,
              type: 'match_found',
              title: 'New match for your saved search!',
              body: `A new ${itemType} item "${item.title}" matches your search: ${search.name}.`,
              link: itemUrl,
            }
          });

          // Update the lastCheckedAt timestamp
          await tx.savedSearch.update({
            where: { id: search.id },
            data: { lastCheckedAt: new Date() }
          });

          // Check email prefs (defaults to true if not set or valid JSON)
          let sendEmail = true;
          if (search.user.notificationPrefs) {
            try {
              const prefs = JSON.parse(search.user.notificationPrefs);
              if (prefs.email === false) sendEmail = false;
            } catch (e) {
              // ignore parsing error
            }
          }

          if (sendEmail && search.user.email) {
            try {
              await sendSearchAlertEmail(
                search.user.email,
                search.user.displayName,
                search.name,
                item.title,
                itemUrl,
                locationString
              );
              // Mark email as sent
              await tx.savedSearchAlertDelivery.update({
                where: { id: delivery.id },
                data: { emailSent: true }
              });
            } catch (err) {
              logger.error('Failed to send search alert email', { error: String(err), searchId: search.id });
              // We do not fail the transaction if email fails, because the notification was delivered.
            }
          }
        });
      } catch (err) {
        logger.error('Transaction failed for alert delivery', { error: String(err), searchId: search.id });
      }
    }

    logger.info(`Processed ${searches.length} saved searches for new ${itemType} item ${item.id}. Found ${matchesToNotify.length} matches.`);

  } catch (error) {
    logger.error('Failed to run checkSavedSearchesForMatch', { error, itemType, itemId: item.id });
  }
}
