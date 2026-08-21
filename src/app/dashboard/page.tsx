import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guards';
import Link from 'next/link';
import { PackageSearch, Search, AlertCircle, Clock, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { claimStates } from '@/lib/config';
import { ItemActions } from '@/components/item/ItemActions';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Dashboard | FoundIt',
};

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch basic stats and items
  const [lostItems, foundItems, pendingClaims] = await Promise.all([
    db.lostItem.findMany({ 
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    db.foundItem.findMany({ 
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    db.claim.count({ 
      where: { 
        claimantId: user.userId,
        status: {
          in: [claimStates.SUBMITTED, claimStates.UNDER_REVIEW, claimStates.PAYMENT_PENDING]
        }
      } 
    })
  ]);

  const lostCount = lostItems.filter(i => i.status === 'active').length;
  const foundCount = foundItems.filter(i => i.status === 'active').length;
  
  const allListings = [
    ...lostItems.map(i => ({ ...i, itemType: 'lost' as const })),
    ...foundItems.map(i => ({ ...i, itemType: 'found' as const }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1">Overview</h1>
        <p className="text-[var(--text-secondary)]">Manage your listings, claims, and account activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Active Lost Items</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{lostCount}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center shrink-0">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Active Found Items</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{foundCount}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Pending Claims</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{pendingClaims}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/report/lost" className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--color-primary-500)] hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)] transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Report Lost Item</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Create a new listing for something you lost.</p>
                </div>
              </div>
            </Link>
            
            <Link href="/report/found" className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--color-primary-500)] hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)] transition-colors">
                  <PackageSearch className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Report Found Item</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Help someone get their item back.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity placeholder */}
        <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Your Active Listings</h2>
          
          {allListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center border border-dashed border-[var(--border-primary)] rounded-xl bg-[var(--bg-secondary)]">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-medium">No listings yet</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Report a lost or found item to get started.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {allListings.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] hover:border-[var(--color-primary-500)] transition-all bg-[var(--bg-secondary)] gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={item.itemType === 'lost' ? 'lost' : 'found'} size="sm">
                        {item.itemType === 'lost' ? 'Lost' : 'Found'}
                      </Badge>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <Link href={`/${item.itemType}/${item.slug}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary-600)] transition-colors line-clamp-1 block">
                      {item.title}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {item.publicDescription}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center">
                    <ItemActions itemId={item.id} itemType={item.itemType} itemSlug={item.slug} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
