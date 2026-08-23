'use client';

import { useState } from 'react';
import { changePassword } from '@/actions/auth';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ChangePasswordSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    if (result.success) {
      setSuccess('Password updated successfully!');
      setIsEditing(false);
      setLoading(false);
      // Optional: Clear success message after a few seconds
      setTimeout(() => setSuccess(null), 5000);
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border-b border-[var(--border-primary)]">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center dark:bg-gray-800 dark:text-gray-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Security</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage your password and security preferences.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      {!isEditing ? (
        <button 
          type="button" 
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Change Password
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4 p-5 border border-[var(--border-primary)] rounded-2xl bg-[var(--bg-secondary)]">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            error={fieldErrors.currentPassword?.[0]}
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            error={fieldErrors.newPassword?.[0]}
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            error={fieldErrors.confirmPassword?.[0]}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setError(null);
                setFieldErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
