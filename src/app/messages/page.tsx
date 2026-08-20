import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Messages | FoundIt',
};

export default async function InboxPage() {
  const session = await getSession();
  
  if (!session.userId) {
    redirect('/login?redirect=/messages');
  }

  const conversations = await db.conversation.findMany({
    where: {
      OR: [
        { user1Id: session.userId },
        { user2Id: session.userId }
      ]
    },
    include: {
      user1: { select: { id: true, displayName: true, avatar: true } },
      user2: { select: { id: true, displayName: true, avatar: true } },
      claim: { include: { foundItem: { select: { title: true, slug: true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-140px)]">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-[var(--text-secondary)]">Communicate securely with finders and claimants.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-sm overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-1">When your claims are approved, you can start messaging here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-primary)]">
            {conversations.map((conv) => {
              const otherUser = conv.user1Id === session.userId ? conv.user2 : conv.user1;
              const lastMessage = conv.messages[0];
              const isUnread = lastMessage && lastMessage.senderId !== session.userId && !lastMessage.readAt;

              return (
                <Link 
                  key={conv.id} 
                  href={`/messages/${conv.id}`}
                  className="block p-4 sm:p-6 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-secondary-500)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {otherUser.displayName.charAt(0).toUpperCase()}
                      </div>
                      {isUnread && (
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[var(--bg-primary)] rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${isUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {otherUser.displayName}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                            {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge size="sm" variant="secondary" className="truncate max-w-full">
                          Re: {conv.claim ? conv.claim.foundItem.title : (conv.lostItem ? conv.lostItem.title : 'Item')}
                        </Badge>
                      </div>

                      {lastMessage ? (
                        <p className={`text-sm truncate ${isUnread ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {lastMessage.senderId === session.userId && 'You: '}{lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--text-tertiary)] italic">No messages yet. Start the conversation!</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
