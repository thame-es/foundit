import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ClaimsList } from '@/components/dashboard/ClaimsList';
import { ShieldCheck, Inbox } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Claims | Dashboard',
};

export default async function ClaimsDashboardPage() {
  const session = await getSession();
  
  if (!session.userId) {
    redirect('/login?redirect=/dashboard/claims');
  }

  // Fetch claims made BY the user
  const myClaims = await db.claim.findMany({
    where: { claimantId: session.userId },
    include: {
      foundItem: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch claims made ON the user's found items
  const claimsOnMyItems = await db.claim.findMany({
    where: {
      foundItem: { userId: session.userId }
    },
    include: {
      foundItem: true,
      claimant: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Claims Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage items you are claiming and review claims on items you found.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Claims on Items I Found */}
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[var(--color-secondary-500)]" /> 
            Claims for Items You Found
          </h2>
          
          {claimsOnMyItems.length === 0 ? (
            <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-8 text-center text-[var(--text-secondary)]">
              No one has claimed your found items yet.
            </div>
          ) : (
            <ClaimsList claims={claimsOnMyItems} mode="received" />
          )}
        </section>

        {/* Claims I Made */}
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-primary-500)]" /> 
            Your Submitted Claims
          </h2>
          
          {myClaims.length === 0 ? (
            <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-8 text-center text-[var(--text-secondary)]">
              You haven't submitted any claims yet.
            </div>
          ) : (
            <ClaimsList claims={myClaims} mode="submitted" />
          )}
        </section>
      </div>
      
    </div>
  );
}
