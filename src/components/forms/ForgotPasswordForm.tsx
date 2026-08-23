'use client';

import { useState } from 'react';
import { requestPasswordReset } from '@/actions/password';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result.success) {
      setSuccessMessage(result.message || 'If an eligible account exists for that email, we have sent a password reset link.');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (successMessage) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30 dark:text-green-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Check your email</h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          {successMessage}
        </p>
        <Link href="/auth/login" className="text-[var(--text-primary)] font-medium hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-sky-900/30 dark:text-sky-500">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Reset Password</h1>
        <p className="text-[var(--text-secondary)]">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}
