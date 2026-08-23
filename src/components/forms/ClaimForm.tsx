'use client';

// ===========================================
// FoundIt — Submit Claim Page & Form
// ===========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Info, Loader2, ArrowRight } from 'lucide-react';
import { submitClaim } from '@/actions/claims';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ClaimPageProps {
  foundItemId: string;
  itemTitle: string;
  userLostItems: { id: string; title: string }[];
}

export function ClaimForm({ foundItemId, itemTitle, userLostItems }: ClaimPageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [proof, setProof] = useState('');
  const [lostItemId, setLostItemId] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proof.length < 10) {
      addToast('error', 'Please provide more detail in your verification proof.');
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('foundItemId', foundItemId);
    formData.append('verificationProof', proof);
    formData.append('lostItemId', lostItemId);

    try {
      const result = await submitClaim(formData);
      
      if (result.success) {
        addToast('success', 'Claim submitted successfully! The finder will review your proof.');
        router.push('/dashboard/claims');
      } else {
        addToast('error', result.error || 'Failed to submit claim.');
      }
    } catch {
      addToast('error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-primary)]">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Claim Item</h1>
            <p className="text-[var(--text-secondary)]">You are claiming: <span className="font-semibold text-[var(--text-primary)]">{itemTitle}</span></p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-info-light)] border border-[var(--color-info)]/20 mb-8">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[var(--color-info)] flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-info)]">Verification Process</h4>
              <p className="text-sm mt-1 text-[var(--color-info)]/80">
                The finder holds a private verification detail about this item that was not published.
                You must describe the item accurately enough to match their private detail to prove ownership.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Verification Proof *
            </label>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Describe unique aspects of the item. e.g., &quot;The lock screen is a picture of my golden retriever&quot;, &quot;There is a $20 bill and a library card inside&quot;, &quot;It has a deep scratch on the bottom left corner&quot;.
            </p>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] min-h-[150px] text-sm"
              placeholder="Detailed description only the owner would know..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              required
              minLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Related Lost Report (Optional)
            </label>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              If you previously reported this item as lost, link it here. When the finder returns this item to you, your lost report will automatically be marked as recovered.
            </p>
            <select
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] text-sm appearance-none"
              value={lostItemId}
              onChange={(e) => setLostItemId(e.target.value)}
            >
              <option value="none">I did not create a lost report</option>
              {userLostItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-[var(--border-primary)]">
            <Button 
              type="submit" 
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              {isSubmitting ? 'Submitting Claim...' : 'Submit Claim Request'}
            </Button>
            <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
              By submitting this claim, you confirm under penalty of fraud that this item belongs to you.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
