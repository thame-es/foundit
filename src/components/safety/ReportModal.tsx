'use client';

import { useState } from 'react';
import { reportEntity, blockUser } from '@/actions/safety';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'item' | 'lost_item' | 'found_item';
  targetId: string;
  targetName: string;
}

const REPORT_REASONS = [
  'Spam or misleading',
  'Offensive or inappropriate content',
  'Fraud or scam',
  'Harassment',
  'Other'
];

export function ReportModal({ isOpen, onClose, targetType, targetId, targetName }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [blockAlso, setBlockAlso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reportRes = await reportEntity(targetType, targetId, reason, description);
      
      if (!reportRes.success) {
        addToast('error', reportRes.error || 'Failed to submit report');
        setIsSubmitting(false);
        return;
      }

      if (blockAlso && targetType === 'user') {
        await blockUser(targetId, 'Blocked during report');
      }

      addToast('success', 'Report submitted successfully. Thank you for keeping FindBack safe.');
      onClose();
      
      if (blockAlso && targetType === 'user') {
        router.push('/dashboard');
      }
    } catch (err) {
      addToast('error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" /> Report {targetType === 'user' ? 'User' : 'Item'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            You are reporting <strong>{targetName}</strong>. This information will be sent to our moderation team.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <select 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Details (Optional)</label>
              <textarea 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none h-24 resize-none"
                placeholder="Provide additional details to help us understand the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {targetType === 'user' && (
              <label className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={blockAlso}
                  onChange={(e) => setBlockAlso(e.target.checked)}
                  className="rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-red-800 dark:text-red-400 font-medium">Also block this user</span>
              </label>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" loading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
