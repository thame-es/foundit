import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | FoundIt',
  description: 'Reset your FoundIt password securely.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
