import { Search, PackageSearch } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Post an Item | FoundIt',
};

export default function ReportLandingPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">What do you want to report?</h1>
        <p className="text-lg text-[var(--text-secondary)]">Choose whether you lost an item or found someone else's item.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Link 
          href="/report/lost" 
          className="group relative bg-[var(--bg-primary)] p-8 rounded-3xl border-2 border-[var(--border-primary)] hover:border-[var(--color-primary-500)] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="w-20 h-20 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10">
            <Search className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 relative z-10">I Lost Something</h2>
          <p className="text-[var(--text-secondary)] relative z-10 leading-relaxed">
            Create a listing for an item you lost. Finders can search for it and contact you to arrange a safe return.
          </p>
        </Link>

        <Link 
          href="/report/found" 
          className="group relative bg-[var(--bg-primary)] p-8 rounded-3xl border-2 border-[var(--border-primary)] hover:border-[var(--color-success)] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-success)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="w-20 h-20 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10">
            <PackageSearch className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 relative z-10">I Found Something</h2>
          <p className="text-[var(--text-secondary)] relative z-10 leading-relaxed">
            Create a listing for an item you found. The owner can claim it by providing proof of ownership.
          </p>
        </Link>
      </div>
    </div>
  );
}
