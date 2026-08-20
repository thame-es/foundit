'use client';

// ===========================================
// FoundIt — Page Skeleton Loader
// ===========================================
// Reusable skeleton component for page loading states.
// ===========================================

export function PageSkeleton({ variant = 'default' }: { variant?: 'default' | 'cards' | 'detail' }) {
  if (variant === 'cards') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-48 bg-[var(--bg-tertiary)] rounded-xl mb-4 animate-pulse" />
          <div className="h-16 w-full bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden animate-pulse">
                <div className="h-40 bg-[var(--bg-tertiary)]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] p-8 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-20 bg-[var(--bg-tertiary)] rounded-full" />
              <div className="h-4 w-32 bg-[var(--bg-tertiary)] rounded" />
            </div>
            <div className="h-8 w-2/3 bg-[var(--bg-tertiary)] rounded-xl mb-4" />
            <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded mb-2" />
            <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded mb-2" />
            <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded mb-6" />
            <div className="h-64 w-full bg-[var(--bg-tertiary)] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Default
  return (
    <div className="flex-grow flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--bg-tertiary)]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-primary-500)] animate-spin" />
        </div>
        <p className="text-sm text-[var(--text-tertiary)] animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
