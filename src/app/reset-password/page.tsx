'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/actions/auth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append('token', token);
    
    const result = await resetPassword(formData);

    if (result.success) {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          Set new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-primary)] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--border-primary)]">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6 mx-auto text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Password reset successful</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Your password has been successfully updated. Redirecting you to login...
              </p>
              <Link href="/login">
                <Button fullWidth>Go to Login</Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Input
                label="New Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={!token || success}
                error={fieldErrors.password?.[0]}
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={!token || success}
                error={fieldErrors.confirmPassword?.[0]}
              />

              <Button type="submit" fullWidth loading={loading} disabled={!token || success}>
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
