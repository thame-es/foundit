import { Metadata } from 'next';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { searchItems } from '@/actions/search';
import { defaultCategories } from '@/lib/config';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import { Search, Filter, MapPin, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const metadata: Metadata = {
  title: 'Search Lost & Found Items | FoundIt',
  description: 'Search for lost and found items in your area.',
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

  const { success, results, error } = await searchItems({ query, category, type });

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Main Search Input */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Items</h1>
          <form className="flex flex-col sm:flex-row gap-3 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <Input 
                name="q"
                defaultValue={query}
                placeholder="Search for keys, phones, wallets..." 
                className="pl-10 !border-0 bg-transparent shadow-none"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                name="type" 
                defaultValue={type}
                options={[
                  { value: 'all', label: 'Lost & Found' },
                  { value: 'lost', label: 'Only Lost Items' },
                  { value: 'found', label: 'Only Found Items' }
                ]}
                className="!border-0 bg-transparent shadow-none"
              />
            </div>
            <Button type="submit" className="sm:w-auto w-full">Search</Button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] p-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold mb-4 text-[var(--text-primary)]">
                <Filter className="w-4 h-4" /> Filters
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Category</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    <Link 
                      href={`/search?type=${type}${query ? `&q=${query}` : ''}`}
                      className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${!category ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      All Categories
                    </Link>
                    {defaultCategories.map(cat => (
                      <Link 
                        key={cat.slug}
                        href={`/search?category=${cat.slug}&type=${type}${query ? `&q=${query}` : ''}`}
                        className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${category === cat.slug ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {!success ? (
              <div className="p-8 text-center bg-[var(--bg-primary)] rounded-2xl border border-red-200 text-red-600">
                {error || 'Failed to load search results'}
              </div>
            ) : results && results.length === 0 ? (
              <div className="p-16 text-center bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-[var(--text-secondary)] mb-6">Try adjusting your search terms or filters.</p>
                <Link href="/search">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results?.map((item) => (
                  <Link 
                    key={`${item.itemType}-${item.id}`} 
                    href={`/${item.itemType}/${item.slug}`}
                    className="group bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden hover:shadow-md hover:border-[var(--color-primary-300)] transition-all flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-video bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={`/api/uploads/medium/${item.images[0].filename}`} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-[var(--text-tertiary)] opacity-50" />
                      )}
                      <div className="absolute top-2 right-2">
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
                      
                      <h3 className="font-bold text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-[var(--color-primary-600)] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
