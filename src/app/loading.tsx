// ===========================================
// FoundIt — Global Loading State
// ===========================================
// Shown instantly during page transitions while
// server components are fetching data.
// ===========================================

export default function Loading() {
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
