import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { ClaimForm } from '@/components/forms/ClaimForm';

export const metadata: Metadata = {
  title: 'Claim Item | FoundIt',
};

export default async function ClaimItemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  
  if (!session.userId) {
    redirect(`/login?redirect=/claim/${resolvedParams.id}`);
  }

  const item = await db.foundItem.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!item) notFound();

  // You can't claim your own item
  if (item.userId === session.userId) {
    redirect(`/found/${item.slug}`);
  }

  // If item is no longer active
  if (item.status !== 'active') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Item Unavailable</h1>
          <p className="text-[var(--text-secondary)]">This item is no longer available to be claimed. It may have already been returned or hidden by the finder.</p>
        </div>
      </div>
    );
  }

  // Check if user already has an active claim
  const existingClaim = await db.claim.findFirst({
    where: { claimantId: session.userId, foundItemId: item.id, status: { in: ['pending', 'approved'] } }
  });

  if (existingClaim) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Claim Already Submitted</h1>
          <p className="text-[var(--text-secondary)] mb-6">You already have an active claim for this item.</p>
          <a href="/dashboard/claims" className="text-[var(--color-primary-600)] hover:underline font-medium">
            View your claims in Dashboard &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClaimForm foundItemId={item.id} itemTitle={item.title} />
      </div>
    </div>
  );
}
