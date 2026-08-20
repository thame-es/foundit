import { Metadata } from 'next';
import { ReportForm } from '@/components/forms/ReportForm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Report a Found Item',
  description: 'Post details about an item you found to securely connect with the owner.',
};

export default async function ReportFoundPage() {
  const session = await getSession();
  
  if (!session.userId) {
    redirect('/login?redirect=/report/found');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Report a Found Item</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Thank you for being a good Samaritan! List the item securely. We'll ask the claimant to verify their ownership before connecting you.
          </p>
        </div>

        <ReportForm type="found" />
      </div>
    </div>
  );
}
