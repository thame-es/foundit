import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ChatUI } from '@/components/dashboard/ChatUI';
import { ConversationInitializer } from '@/components/dashboard/ConversationInitializer';

export const metadata: Metadata = {
  title: 'Conversation | FoundIt',
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  
  if (!session.userId) {
    redirect(`/login?redirect=/messages/${resolvedParams.id}`);
  }

  // Handle 'new' conversation initiation from an approved claim
  if (resolvedParams.id === 'new') {
    // We expect ?claimId=xxx in the URL for this flow, but Server Components 
    // shouldn't handle query params for mutation. 
    // We'll let a client component handle the redirect or we just show an error here if accessed directly
    // Usually the user will click a link like /messages/new?claimId=123 which triggers the Client side to call `sendMessage`
    return <ConversationInitializer />;
  }

  // Fetch Conversation
  const conversation = await db.conversation.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
      claim: { include: { foundItem: true } },
      lostItem: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      }
    }
  });

  if (!conversation) {
    redirect('/messages');
  }

  // Authorization check
  if (conversation.user1Id !== session.userId && conversation.user2Id !== session.userId) {
    redirect('/messages');
  }

  const otherUser = conversation.user1Id === session.userId ? conversation.user2 : conversation.user1;

  // Mark unread messages as read
  const unreadMessages = conversation.messages.filter(m => m.senderId !== session.userId && !m.readAt);
  if (unreadMessages.length > 0) {
    await db.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: session.userId },
        readAt: null
      },
      data: { readAt: new Date() }
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 h-[calc(100vh-64px)] flex flex-col">
      <ChatUI 
        conversation={conversation} 
        currentUserId={session.userId} 
        otherUser={otherUser} 
      />
    </div>
  );
}
