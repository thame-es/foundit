'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initializeConversation } from '@/actions/messages';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ConversationInitializer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claimId');
  const lostItemId = searchParams.get('lostItemId');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!claimId && !lostItemId) {
      setError('No claim ID or lost item ID provided in the URL.');
      return;
    }

    let isMounted = true;

    async function init() {
      // Pass both or whichever is available
      const res = await initializeConversation(claimId as string, lostItemId as string);
      
      if (!isMounted) return;

      if (res.success && res.conversationId) {
        // Redirect to the newly created (or existing) conversation
        router.replace(`/messages/${res.conversationId}`);
      } else {
        setError(res.error || 'Failed to initialize conversation');
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [claimId, lostItemId, router]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Cannot Start Conversation</h1>
        <p className="text-[var(--text-secondary)] mb-8">{error}</p>
        <Button onClick={() => router.push('/dashboard/claims')} variant="secondary">
          Return to Claims
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <Loader2 className="w-12 h-12 text-[var(--color-primary-600)] animate-spin mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-3">Initializing Conversation...</h1>
      <p className="text-[var(--text-secondary)]">
        Please wait while we set up the secure, private channel.
      </p>
    </div>
  );
}
