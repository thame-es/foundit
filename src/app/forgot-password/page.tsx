'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/actions/auth';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);

    if (result.success) {
      setSuccess(true);
      setLoading(false);
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-primary)] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--border-primary)]">
          {!success ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                error={fieldErrors.email?.[0]}
              />

              <Button type="submit" fullWidth loading={loading}>
                Send reset link
              </Button>
              
              <div className="mt-4 text-center">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6 mx-auto text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Check your email</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                If an account exists with that email, we sent a password reset link. Please check your inbox.
              </p>
              <Link href="/login">
                <Button fullWidth variant="outline">
                  Return to login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
