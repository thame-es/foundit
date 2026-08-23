'use client';

import { useState } from 'react';
import { resetPassword } from '@/actions/password';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setError(result.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30 dark:text-green-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Password reset successful</h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Your FoundIt password was changed successfully. Please sign in again.
        </p>
        <Link 
          href="/auth/login" 
          className="inline-flex items-center justify-center w-full px-4 py-3 bg-[var(--button-primary)] text-white font-medium rounded-xl hover:bg-[var(--button-primary-hover)] transition-colors"
        >
          Sign in to FoundIt
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-indigo-900/30 dark:text-indigo-500">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create New Password</h1>
        <p className="text-[var(--text-secondary)]">
          Your new password must be at least 12 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>
              {error.includes('expired') && (
                <Link href="/auth/forgot-password" className="text-xs font-bold text-red-800 dark:text-red-300 underline mt-1 block">
                  Request a new link
                </Link>
              )}
            </div>
          </div>
        )}

        <Input
          label="New Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={fieldErrors.password?.[0]}
        />
        
        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={fieldErrors.confirmPassword?.[0]}
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Reset Password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Cancel and go back
        </Link>
      </div>
    </div>
  );
}
