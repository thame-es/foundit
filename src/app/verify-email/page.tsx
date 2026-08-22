import { db } from '@/lib/db';
import crypto from 'crypto';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage(props: VerifyEmailPageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  
  if (!token) {
    return <ResultView success={false} message="No verification token provided." />;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const verificationToken = await db.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!verificationToken) {
    return <ResultView success={false} message="Invalid or expired verification link." />;
  }

  if (verificationToken.expiresAt < new Date()) {
    await db.verificationToken.delete({ where: { id: verificationToken.id } });
    return <ResultView success={false} message="This verification link has expired. Please request a new one." />;
  }

  // Update user and delete token
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: verificationToken.userId },
      data: { 
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
    });

    await tx.verificationToken.delete({
      where: { id: verificationToken.id },
    });
  });

  return <ResultView success={true} message="Your email address has been successfully verified." />;
}

function ResultView({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-sm">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {success ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
      </div>
      <h1 className="text-2xl font-bold mb-4">{success ? 'Email Verified!' : 'Verification Failed'}</h1>
      <p className="text-[var(--text-secondary)] mb-8">{message}</p>
      
      <div className="flex flex-col gap-3">
        <Link href="/dashboard" className="w-full">
          <Button variant="primary" className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
