import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | FoundIt',
  description: 'Create a new password for your FoundIt account.',
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
