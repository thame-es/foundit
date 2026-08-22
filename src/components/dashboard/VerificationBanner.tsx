'use client';

import { useState } from 'react';
import { resendVerificationEmail } from '@/actions/verification';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export function VerificationBanner() {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const handleResend = async () => {
    setIsSending(true);
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        addToast('success', 'Verification email sent! Please check your inbox.');
        setSent(true);
      } else {
        addToast('error', res.error || 'Failed to send email');
      }
    } catch (e) {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  if (sent) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-blue-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Please verify your email address to unlock all features and earn your trust badge.</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 flex-shrink-0"
        onClick={handleResend}
        loading={isSending}
      >
        Resend Verification Email
      </Button>
    </div>
  );
}
