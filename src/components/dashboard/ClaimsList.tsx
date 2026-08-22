'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { approveClaim, rejectClaim, confirmHandover } from '@/actions/claims';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { MessageSquare, Check, X, Clock, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ClaimWithRelations = {
  id: string;
  foundItemId: string;
  claimantId: string;
  status: string;
  reasonForClaim: string;
  description: string;
  returnConfirmedByFinder: boolean;
  returnConfirmedByClaimant: boolean;
  createdAt: Date;
  foundItem: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  claimant?: {
    displayName: string;
  };
};

interface ClaimsListProps {
  claims: ClaimWithRelations[];
  mode: 'received' | 'submitted';
}

export function ClaimsList({ claims, mode }: ClaimsListProps) {
  const { addToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (claimId: string) => {
    setProcessingId(claimId);
    try {
      const res = await approveClaim(claimId);
      if (res.success) {
        addToast('success', 'Claim approved successfully!');
      } else {
        addToast('error', res.error || 'Failed to approve claim');
      }
    } catch (e) {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!window.confirm('Are you sure you want to reject this claim? This action cannot be undone.')) return;
    
    setProcessingId(claimId);
    try {
      const res = await rejectClaim(claimId);
      if (res.success) {
        addToast('success', 'Claim rejected.');
      } else {
        addToast('error', res.error || 'Failed to reject claim');
      }
    } catch (e) {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmHandover = async (claimId: string) => {
    if (!window.confirm('Confirm that the item has been successfully handed over?')) return;
    
    setProcessingId(claimId);
    try {
      const res = await confirmHandover(claimId);
      if (res.success) {
        addToast('success', 'Handover confirmed!');
      } else {
        addToast('error', res.error || 'Failed to confirm handover');
      }
    } catch (e) {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {claims.map((claim) => {
        const isExpanded = expandedId === claim.id;
        const isPending = ['submitted', 'under_review'].includes(claim.status);
        const isHandover = ['accepted', 'collection_arranged'].includes(claim.status);

        return (
          <div key={claim.id} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
            
            {/* Header / Summary */}
            <div 
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : claim.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant={['accepted', 'collection_arranged'].includes(claim.status) ? 'success' : claim.status === 'rejected' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {claim.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(claim.createdAt, { addSuffix: true })}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg truncate pr-4">
                  <Link href={`/found/${claim.foundItem.slug}`} className="hover:text-[var(--color-primary-600)] transition-colors" onClick={(e) => e.stopPropagation()}>
                    {claim.foundItem.title}
                  </Link>
                </h3>
                
                {mode === 'received' && claim.claimant && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Claimed by: <span className="font-medium text-[var(--text-primary)]">{claim.claimant.displayName}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                {/* Actions if pending and received */}
                {mode === 'received' && isPending && (
                  <div className="flex gap-2 mr-2" onClick={e => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleReject(claim.id)}
                      disabled={processingId === claim.id}
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingId === claim.id}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Approve
                    </Button>
                  </div>
                )}
                
                {isHandover && (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Link href={`/messages/new?claimId=${claim.id}`}>
                      <Button size="sm" variant="outline" icon={<MessageSquare className="w-4 h-4" />}>
                        Message
                      </Button>
                    </Link>

                    {((mode === 'received' && !claim.returnConfirmedByFinder) || 
                      (mode === 'submitted' && !claim.returnConfirmedByClaimant)) && (
                      <Button 
                        size="sm" 
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                        onClick={() => handleConfirmHandover(claim.id)}
                        disabled={processingId === claim.id}
                        icon={<Check className="w-4 h-4" />}
                      >
                        {mode === 'received' ? 'I Handed It Over' : 'I Received It'}
                      </Button>
                    )}

                    {((mode === 'received' && claim.returnConfirmedByFinder) || 
                      (mode === 'submitted' && claim.returnConfirmedByClaimant)) && (
                      <Badge variant="success" size="sm">
                        Waiting for other party
                      </Badge>
                    )}
                  </div>
                )}

                {claim.status === 'returned' && (
                  <Badge variant="success" size="sm">Handover Complete</Badge>
                )}

                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Verification Proof Provided
                    </h4>
                    <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] text-sm whitespace-pre-wrap text-[var(--text-primary)]">
                      {claim.description}
                    </div>

                    {mode === 'received' && isPending && (
                      <div className="mt-4 p-3 rounded-lg bg-[var(--color-info-light)] border border-[var(--color-info)]/20 text-sm text-[var(--color-info)]/90">
                        Review the proof above carefully. Does it accurately describe your private knowledge of the item? If so, approve the claim to open messaging with this user.
                      </div>
                    )}

                    {isHandover && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Safe Return Checklist
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Meet in a public, well-lit place</li>
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Do not share verification codes prematurely</li>
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Verify the item before completing the handover</li>
                          <li className="flex items-start gap-2 text-rose-700 font-medium"><X className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" /> FindBack does not require advance payments. Never send money.</li>
                          <li className="flex items-start gap-2"><MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> Use in-app messaging to coordinate</li>
                        </ul>
                        <p className="text-xs text-slate-500 mt-3 italic">
                          Click "{mode === 'received' ? 'I Handed It Over' : 'I Received It'}" above once the physical exchange is complete. The return will only be marked as completed when both parties confirm.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        );
      })}
    </div>
  );
}
