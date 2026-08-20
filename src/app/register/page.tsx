'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { register } from '@/actions/auth';
import { AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      if (result.error) {
        setError(result.error);
      }
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
          Create a free account
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-primary)] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--border-primary)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Input
              label="Display Name"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              error={fieldErrors.displayName?.[0]}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              error={fieldErrors.email?.[0]}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              error={fieldErrors.password?.[0]}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              error={fieldErrors.confirmPassword?.[0]}
            />

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] border-[var(--border-primary)] bg-[var(--bg-primary)]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="font-medium text-[var(--text-secondary)]">
                  I accept the Terms of Service and Privacy Policy
                </label>
                {fieldErrors.acceptTerms && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.acceptTerms[0]}</p>
                )}
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
