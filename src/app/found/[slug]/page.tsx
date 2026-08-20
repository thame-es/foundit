import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DynamicLocationPicker } from '@/components/maps';
import { ItemActions } from '@/components/item/ItemActions';
import { getSession } from '@/lib/auth/session';
import { MapPin, Calendar, Clock, ShieldCheck, MessageSquare, Edit, HelpCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await db.foundItem.findUnique({ where: { slug: resolvedParams.slug } });
  if (!item) return { title: 'Not Found' };
  
  return {
    title: `Found: ${item.title}`,
    description: item.publicDescription.substring(0, 160),
  };
}

export default async function FoundItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();
  const item = await db.foundItem.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
      user: {
        select: { displayName: true, createdAt: true }
      },
      images: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!item) notFound();

  const isOwner = session.userId === item.userId;
  const isAdmin = session.role === 'admin';

  const dateStr = item.dateApproximate 
    ? `Around ${format(item.dateFound, 'MMMM do, yyyy')}`
    : format(item.dateFound, 'MMMM do, yyyy');

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Link href="/search?type=found" className="hover:text-[var(--text-primary)] transition-colors">Found Items</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{item.category.name}</span>
          </div>

          {(isOwner || isAdmin) && (
            <ItemActions itemId={item.id} itemType="found" itemSlug={item.slug} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header section */}
            <div className="bg-[var(--bg-primary)] rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--border-primary)]">
              <div className="flex gap-3 mb-4">
                <Badge variant="found" size="md" dot>Found Item</Badge>
                {item.status === 'returned' && <Badge variant="success" size="md">Returned to Owner</Badge>}
                {item.status === 'claim_pending' && <Badge variant="warning" size="md">Claim Pending</Badge>}
                {item.status === 'hidden' && <Badge variant="secondary" size="md">Hidden</Badge>}
              </div>
              
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{item.title}</h1>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)] mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dateStr}</span>
                </div>
                {item.timeFound && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{item.timeFound}</span>
                  </div>
                )}
                {item.area && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.area}{item.city ? `, ${item.city}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{item.publicDescription}</p>
              </div>

              {/* Attributes Grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Brand</div>
                  <div className="font-medium text-sm">{item.brand || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Model</div>
                  <div className="font-medium text-sm">{item.model || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Colour</div>
                  <div className="font-medium text-sm capitalize">{item.colour || 'Not specified'}</div>
                </div>
              </div>

              {/* Verification Info Panel */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--color-info-light)] border border-[var(--color-info)]/20">
                <h3 className="text-sm font-semibold text-[var(--color-info)] mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Ownership Verification
                </h3>
                <p className="text-sm text-[var(--color-info)]/90">
                  To claim this item, you will need to provide specific details about it (e.g., contents, lock screen, specific damage) to prove you are the rightful owner.
                </p>
              </div>
            </div>

            {/* Images */}
            {item.images.length > 0 && (
              <div className="bg-[var(--bg-primary)] rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {item.images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-primary)]">
                      <img 
                        src={`/api/uploads/medium/${img.filename}`} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Map */}
            {item.latitude && item.longitude && (
              <div className="bg-[var(--bg-primary)] rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-4">Location Found</h3>
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-[var(--border-primary)] relative z-0">
                   <DynamicLocationPicker 
                    initialPosition={[item.latitude, item.longitude]}
                    readOnly={true}
                   />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-[var(--bg-primary)] rounded-2xl p-6 shadow-sm border border-[var(--border-primary)]">
              {isOwner ? (
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-xl">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[var(--color-primary-500)]" />
                  <p className="font-semibold">This is your listing</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Review claims here when owners contact you.</p>
                  <Link href={`/dashboard/claims`} className="block mt-4">
                    <Button variant="outline" fullWidth size="sm">Manage Claims</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-2">Is this yours?</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    If this is your item, initiate a secure claim. You'll need to prove ownership to the finder.
                  </p>
                  <Link href={`/claim/${item.id}`}>
                    <Button fullWidth size="lg" icon={<ShieldCheck className="w-5 h-5" />}>Claim This Item</Button>
                  </Link>
                  <Link href={`/how-it-works#claiming`} className="block mt-4 text-center text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1">
                    <HelpCircle className="w-3 h-3" /> How claiming works
                  </Link>
                </>
              )}
            </div>

            {/* Reporter Info */}
            <div className="bg-[var(--bg-primary)] rounded-2xl p-6 shadow-sm border border-[var(--border-primary)]">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Found By</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-secondary-400)] to-[var(--color-secondary-600)] flex items-center justify-center text-white font-bold text-lg">
                  {item.user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{item.user.displayName}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Good Samaritan</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="text-xs text-[var(--text-tertiary)] text-center">
              Listing ID: {item.id.split('-')[0]}<br />
              Posted {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
