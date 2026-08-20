// ===========================================
// FoundIt — Header Badges (Server Component)
// ===========================================
// Streams notification/message counts independently
// so the rest of the page doesn't wait for these queries.
// ===========================================

import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { HeaderBadgesClient } from './HeaderBadgesClient';

export async function HeaderBadges() {
  const user = await getCurrentUser();
  
  if (!user) return <HeaderBadgesClient notificationCount={0} messageCount={0} />;

  let notificationCount = 0;
  let messageCount = 0;

  try {
    // Run both queries in parallel for speed
    const [notifCount, msgCount] = await Promise.all([
      db.notification.count({
        where: { userId: user.userId, readAt: null },
      }),
      db.message.count({
        where: {
          senderId: { not: user.userId },
          readAt: null,
          conversation: {
            OR: [
              { user1Id: user.userId },
              { user2Id: user.userId },
            ],
            status: 'active',
          },
        },
      }),
    ]);

    notificationCount = notifCount;
    messageCount = msgCount;
  } catch (e) {
    console.error('Error fetching badge counts:', e);
  }

  return <HeaderBadgesClient notificationCount={notificationCount} messageCount={messageCount} />;
}
