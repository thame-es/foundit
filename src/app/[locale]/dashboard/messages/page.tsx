import { requireAuth } from '@/lib/auth/guards';
import { Mail, Search, MessageSquare, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Messages | Dashboard | FoundIt',
};

export default async function MessagesPage() {
  const user = await requireAuth();

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ user1Id: user.userId }, { user2Id: user.userId }]
    },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
      claim: { include: { foundItem: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Messages Yet</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              When you claim an item or someone claims an item you've found, your secure conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-primary)]">
            {conversations.map((conv) => {
              const otherUser = conv.user1Id === user.userId ? conv.user2 : conv.user1;
              const lastMessage = conv.messages[0];
              const isUnread = lastMessage && lastMessage.senderId !== user.userId && !lastMessage.readAt;

              return (
                <Link 
                  key={conv.id} 
                  href={`/messages/${conv.id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-[var(--bg-tertiary)] transition-colors ${isUnread ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-secondary-500)] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {otherUser.displayName.charAt(0).toUpperCase()}
                    {isUnread && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-primary-500)] border-2 border-[var(--bg-primary)] rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold truncate ${isUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {otherUser.displayName}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                      {conv.claim?.foundItem?.title && (
                        <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-xs font-medium truncate max-w-[120px]">
                          {conv.claim.foundItem.title}
                        </span>
                      )}
                      <p className={`truncate ${isUnread ? 'font-medium text-[var(--text-primary)]' : ''}`}>
                        {lastMessage ? (
                          lastMessage.senderId === user.userId ? `You: ${lastMessage.content}` : lastMessage.content
                        ) : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
