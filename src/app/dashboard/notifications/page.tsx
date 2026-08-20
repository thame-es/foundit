import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle2, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notifications | FoundIt',
};

export default async function NotificationsPage() {
  const session = await getSession();
  
  if (!session.userId) {
    redirect('/login?redirect=/dashboard/notifications');
  }

  // Fetch notifications
  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // Mark all as read
  if (notifications.some(n => !n.readAt)) {
    await db.notification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: new Date() }
    });
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'claim_update':
        return <ShieldCheck className="w-5 h-5 text-[var(--color-primary-500)]" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-[var(--color-secondary-500)]" />;
      case 'match_found':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-[var(--text-tertiary)]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] flex items-center justify-center">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)]">Stay updated on your claims and messages.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm mt-1">You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-primary)]">
            {notifications.map((notification) => (
              <Link 
                key={notification.id} 
                href={notification.link || '#'}
                className={`block p-4 sm:p-5 hover:bg-[var(--bg-secondary)] transition-colors ${!notification.readAt ? 'bg-[var(--color-primary-50)]/50 dark:bg-[var(--color-primary-900)]/10' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.readAt ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50' : 'bg-[var(--bg-secondary)]'}`}>
                    {getIconForType(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold text-sm ${!notification.readAt ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap ml-2">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.readAt ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'}`}>
                      {notification.body}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
