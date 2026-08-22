'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { sendMessage } from '@/actions/messages';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ReportModalToggle } from '@/components/safety/ReportModalToggle';

// Types simplified for UI
type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
};

interface ChatUIProps {
  conversation: {
    id: string;
    messages: Message[];
    claim: {
      foundItem: {
        title: string;
        slug: string;
      }
    } | null;
    lostItem: {
      title: string;
      slug: string;
    } | null;
  };
  currentUserId: string;
  otherUser: {
    id: string;
    displayName: string;
  };
}

export function ChatUI({ conversation, currentUserId, otherUser }: ChatUIProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Basic polling for MVP (In production, use WebSockets/Pusher)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // This will re-fetch the page data from the server
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  // Update local state if server data changes (via refresh)
  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      senderId: currentUserId,
      content,
      createdAt: new Date(),
      readAt: null
    };
    
    setMessages(prev => [...prev, newMsg]);

    try {
      const formData = new FormData();
      formData.append('conversationId', conversation.id);
      formData.append('content', content);

      const result = await sendMessage(formData);
      
      if (!result.success) {
        // Revert optimistic update
        setMessages(prev => prev.filter(m => m.id !== tempId));
        addToast('error', result.error || 'Failed to send message');
      } else {
        // We rely on router.refresh() or the next poll to get the real ID, 
        // but it looks instant to the user.
        router.refresh();
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      addToast('error', 'An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-sm overflow-hidden flex-1">
      
      {/* Chat Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-secondary-500)] flex items-center justify-center text-white font-bold flex-shrink-0">
              {otherUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[var(--text-primary)]">{otherUser.displayName}</h2>
                <ReportModalToggle targetType="user" targetId={otherUser.id} targetName={otherUser.displayName} variant="text" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-tertiary)]">Re:</span>
                <Link href={conversation.claim ? `/found/${conversation.claim.foundItem.slug}` : `/lost/${conversation.lostItem?.slug}`} className="text-xs font-medium text-[var(--color-primary-600)] hover:underline truncate max-w-[200px] sm:max-w-[300px]">
                  {conversation.claim?.foundItem.title || conversation.lostItem?.title}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {conversation.claim && (
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Claim Approved
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Safety Warning (Sticky) */}
      <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 p-2 sm:p-3 text-xs sm:text-sm flex gap-2 items-start text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p><strong>Safety First:</strong> Meet in a well-lit, public place like a police station or coffee shop to return the item. Never wire money.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-secondary)] space-y-4">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Say Hello!</p>
              <p className="text-sm max-w-sm mx-auto mt-1">The claim was approved. Coordinate a safe time and place to return the item.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const showTime = idx === 0 || new Date(msg.createdAt).getTime() - new Date(messages[idx-1].createdAt).getTime() > 5 * 60 * 1000;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showTime && (
                  <span className="text-[10px] text-[var(--text-tertiary)] mb-2 px-2">
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </span>
                )}
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm sm:text-base shadow-sm ${
                    isMe 
                      ? 'bg-[var(--color-primary-600)] text-white rounded-tr-sm' 
                      : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                {isMe && msg.id.startsWith('temp') && (
                  <span className="text-[10px] text-[var(--text-tertiary)] mt-1 mr-1">Sending...</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
        <form onSubmit={handleSend} className="flex items-end gap-2 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 max-h-32 min-h-[48px] px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] resize-none text-sm transition-shadow"
            rows={1}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isSending}
            size="md"
            className="h-12 w-12 rounded-xl flex-shrink-0 !px-0 flex justify-center"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-[var(--text-tertiary)] mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

    </div>
  );
}
