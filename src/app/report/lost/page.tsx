import { Metadata } from 'next';
import { ReportForm } from '@/components/forms/ReportForm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Report a Lost Item',
  description: 'Post details about an item you lost to securely connect with finders in your area.',
};

export default async function ReportLostPage() {
  const session = await getSession();
  
  // Extra safety check in case middleware misses
  if (!session.userId) {
    redirect('/login?redirect=/report/lost');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Report a Lost Item</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Provide as many details as possible to help the community match your item. We'll notify you if someone reports finding something similar.
          </p>
        </div>

        <ReportForm type="lost" />
      </div>
    </div>
  );
}
