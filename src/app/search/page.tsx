import { Metadata } from 'next';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { searchItems, SearchParams } from '@/actions/search';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { appConfig } from '@/lib/config';
import Link from 'next/link';
import { Search, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SearchClientFilters, SidebarFilters, EmptySearchState } from '@/components/search/SearchFilters';

export const metadata: Metadata = {
  title: 'Search Lost & Found Items | FoundIt',
  description: 'Search for lost and found items with advanced filters.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const type = typeof resolvedParams.type === 'string' && ['lost', 'found', 'all'].includes(resolvedParams.type) 
    ? resolvedParams.type as 'lost' | 'found' | 'all' 
    : 'all';
  const lat = typeof resolvedParams.lat === 'string' ? parseFloat(resolvedParams.lat) : undefined;
  const lng = typeof resolvedParams.lng === 'string' ? parseFloat(resolvedParams.lng) : undefined;
  const radius = typeof resolvedParams.radius === 'string' ? parseFloat(resolvedParams.radius) : undefined;
  const date = typeof resolvedParams.date === 'string' ? resolvedParams.date : undefined;
  const brand = typeof resolvedParams.brand === 'string' ? resolvedParams.brand : undefined;
  const colour = typeof resolvedParams.colour === 'string' ? resolvedParams.colour : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort as any : 'newest';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;

  const filters: SearchParams = {
    query, category, type, lat, lng, radius, date, brand, colour, sort, page
  };

  const { success, results, hasMore, error } = await searchItems(filters);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Items</h1>
          <Suspense fallback={<div className="h-16 bg-[var(--bg-primary)] animate-pulse rounded-2xl" />}>
            <SearchClientFilters />
          </Suspense>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="h-96 bg-[var(--bg-primary)] animate-pulse rounded-2xl" />}>
              <SidebarFilters />
            </Suspense>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {!success ? (
              <div className="p-8 text-center bg-[var(--bg-primary)] rounded-2xl border border-red-200 text-red-600">
                {error || 'Failed to load search results'}
              </div>
            ) : results && results.length === 0 ? (
              <EmptySearchState />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results?.map((item: any) => (
                    <Link 
                      key={`${item.itemType}-${item.id}`} 
                      href={`/${item.itemType}/${item.slug}`}
                      className="group bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden hover:shadow-md hover:border-[var(--color-primary-300)] transition-all flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <ImageWithFallback 
                            src={`/api/uploads/medium/${item.images[0].filename}`} 
                            fallbackSrc={`/images/social-fallback.png`}
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-[var(--text-tertiary)] opacity-50" />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {item.distance !== undefined && item.distance !== Infinity && (
                            <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-md">
                              {item.distance < 1 ? '< 1 km' : `~ ${Math.round(item.distance)} km`}
                            </Badge>
                          )}
                          <Badge variant={item.itemType === 'lost' ? 'lost' : 'found'}>
                            {item.itemType === 'lost' ? 'Lost' : 'Found'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" size="sm" className="font-normal">{item.category?.name}</Badge>
                          <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                            {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-[var(--color-primary-600)] transition-colors break-words">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1 break-words">
                          {item.publicDescription}
                        </p>
                        
                        <div className="pt-3 border-t border-[var(--border-primary)] flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                          {item.area && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[100px]">{item.area}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(item.itemType === 'lost' ? item.dateLost : item.dateFound).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                  {page > 1 && (
                    <Link href={`/search?${new URLSearchParams({ ...resolvedParams, page: (page - 1).toString() } as any).toString()}`}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    Page {page}
                  </span>
                  {hasMore && (
                    <Link href={`/search?${new URLSearchParams({ ...resolvedParams, page: (page + 1).toString() } as any).toString()}`}>
                      <Button variant="outline">Next Page</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
