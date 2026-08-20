'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/actions/auth';
import { Trash2, AlertTriangle } from 'lucide-react';

export function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
          <p className="text-sm text-[var(--text-secondary)]">Permanently delete your account and all associated data.</p>
        </div>
      </div>
      
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors"
        >
          Delete My Account
        </button>
      ) : (
        <div className="max-w-lg space-y-4 p-5 border-2 border-red-200 rounded-2xl bg-red-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Are you absolutely sure?</p>
              <p className="text-sm text-red-600 mt-1">
                This action <strong>cannot be undone</strong>. This will permanently deactivate your account, remove all your listings, and revoke access to the platform.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-red-700 mb-1.5">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 rounded-xl border border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || isDeleting}
              className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
            </button>
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setConfirmText(''); }}
              className="px-6 py-2.5 border border-[var(--border-primary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
