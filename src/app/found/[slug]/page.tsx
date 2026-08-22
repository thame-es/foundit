import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DynamicLocationPicker } from '@/components/maps';
import { ItemActions } from '@/components/item/ItemActions';
import { UserTrustProfile, TrustExplanation } from '@/components/item/UserTrustProfile';
import { ReportModalToggle } from '@/components/safety/ReportModalToggle';
import { getSession } from '@/lib/auth/session';
import { MapPin, Calendar, Clock, ShieldCheck, MessageSquare, Edit, HelpCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { appConfig } from '@/lib/config';
import { ShareMenu } from '@/components/item/ShareMenu';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await db.foundItem.findUnique({ where: { slug: resolvedParams.slug }, include: { images: true } });
  if (!item) return { title: 'Not Found' };
  
  const title = `Found: ${item.title}`;
  const description = item.publicDescription.substring(0, 160);
  const canonicalUrl = `${appConfig.url}/found/${item.slug}`;
  const imageUrl = (item.images && item.images.length > 0 && item.images[0].filename) 
    ? `${appConfig.url}/api/uploads/medium/${item.images[0].filename}` 
    : `${appConfig.url}/images/social-fallback.png`;
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: appConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
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
        select: { id: true, displayName: true, createdAt: true, emailVerified: true, businessAccount: true }
      },
      images: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!item) notFound();

  const isOwner = session.userId === item.userId;
  const isAdmin = session.role === 'admin';

  const successfulReturns = await db.claim.count({
    where: {
      status: 'returned',
      OR: [
        { claimantId: item.userId },
        { foundItem: { userId: item.userId } }
      ]
    }
  });

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

          <div className="flex items-center gap-3">
            <ShareMenu 
              url={`${appConfig.url}/found/${item.slug}`}
              title={`Found: ${item.title}`}
              description={item.publicDescription}
              itemId={item.id}
              itemSlug={item.slug}
              itemType="found"
            />
            {(isOwner || isAdmin) && (
              <ItemActions itemId={item.id} itemType="found" itemSlug={item.slug} />
            )}
          </div>
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
              
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4 break-words">{item.title}</h1>
              
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

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full overflow-hidden">
                <p className="whitespace-pre-wrap text-[var(--text-secondary)] break-words w-full">{item.publicDescription}</p>
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
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-primary)] bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={`${appConfig.url}/api/uploads/medium/${img.filename}`} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = `${appConfig.url}/images/social-fallback.png`; }}
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
              ) : item.status === 'returned' ? (
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-semibold text-emerald-800">Item Returned</p>
                  <p className="text-sm text-emerald-700 mt-1">This item has been successfully returned to its rightful owner.</p>
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
                  
                  <div className="mt-4">
                    <TrustExplanation />
                  </div>
                </>
              )}
            </div>

            {/* Reporter Info */}
            <UserTrustProfile user={item.user as any} successfulReturns={successfulReturns} />

            {/* Meta */}
            <div className="text-xs text-[var(--text-tertiary)] text-center">
              Listing ID: {item.id.split('-')[0]}<br />
              Posted {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </div>

            {!isOwner && session.userId && (
              <ReportModalToggle targetType="item" targetId={item.id} targetName={item.title} variant="text" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
