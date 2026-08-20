import { Metadata } from 'next';
import { Building2, Search, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'For Businesses | FoundIt',
};

export default function ForBusinessesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">FoundIt for Business</h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          Modernize your lost and found department. Reduce storage costs, delight your customers, and turn a frustrating experience into a moment of magic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)] text-center">
          <div className="w-14 h-14 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Reduce Overhead</h3>
          <p className="text-[var(--text-secondary)]">
            Stop answering endless phone calls. Direct customers to your FoundIt public inventory page to search for their items themselves.
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)] text-center">
          <div className="w-14 h-14 bg-[var(--color-accent-100)] text-[var(--color-accent-600)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Automated Matching</h3>
          <p className="text-[var(--text-secondary)]">
            Our algorithm automatically flags potential matches between what your staff finds and what your customers report lost.
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)] text-center">
          <div className="w-14 h-14 bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Secure Verification</h3>
          <p className="text-[var(--text-secondary)]">
            Handle claims digitally. Verify ownership through private descriptions before an item ever leaves the security desk.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[var(--color-primary-700)] via-[var(--color-primary-600)] to-[var(--color-accent-600)] text-white p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-secondary-400)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-sm">Ready to upgrade your property?</h2>
            <p className="!text-blue-50 max-w-lg text-lg font-normal leading-relaxed opacity-90 mt-2">
              FoundIt is perfect for airports, universities, stadiums, hotels, and mass transit authorities.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="mailto:enterprise@foundit.example.com">
              <Button size="xl" className="bg-white !text-[var(--color-primary-700)] hover:bg-gray-50 shadow-xl border-none">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
