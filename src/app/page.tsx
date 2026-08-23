import Link from 'next/link';
import { Search, MapPin, ShieldCheck, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { defaultCategories } from '@/lib/config';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[var(--color-primary-300)] to-[var(--color-accent-300)] blur-[100px]" />
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[var(--color-secondary-300)] to-[var(--color-primary-200)] blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Lost something? <br />
                <span className="gradient-text">Find your way back.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-8 max-w-lg">
                The secure, community-driven platform to report lost items and safely connect with finders. Zero cost, total peace of mind.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/report/lost">
                  <Button size="xl" fullWidth>I Lost an Item</Button>
                </Link>
                <Link href="/report/found">
                  <Button size="xl" variant="secondary" fullWidth>I Found an Item</Button>
                </Link>
              </div>

              {/* Quick Search */}
              <div className="p-4 rounded-2xl glass shadow-lg border border-[var(--border-primary)]/50">
                <form action="/search" className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <Input 
                      name="q"
                      placeholder="Search for keys, phones, wallets..." 
                      className="pl-10 !border-0 bg-[var(--bg-primary)] shadow-sm"
                    />
                  </div>
                  <Button type="submit" className="sm:w-auto w-full whitespace-nowrap">
                    Search Now
                  </Button>
                </form>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="flex justify-center relative mt-8 lg:mt-0">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-md aspect-square">
                {/* Decorative floating elements */}
                <div className="absolute -top-2 right-0 sm:top-10 sm:right-10 p-3 sm:p-4 rounded-2xl glass shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-600)]">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold">Location Match!</p>
                      <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">200m away</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-2 left-0 sm:bottom-20 sm:left-0 p-3 sm:p-4 rounded-2xl glass shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-success-light)] flex items-center justify-center text-[var(--color-success)]">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold">Item Returned</p>
                      <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Just now</p>
                    </div>
                  </div>
                </div>

                {/* Main graphic */}
                <svg viewBox="0 0 400 400" className="w-full h-full text-[var(--text-primary)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Central Hub */}
                  <circle cx="200" cy="200" r="100" fill="url(#heroGradient)" fillOpacity="0.1" />
                  <circle cx="200" cy="200" r="100" stroke="url(#heroGradient)" strokeWidth="2" strokeDasharray="8 8" className="animate-[spin_20s_linear_infinite]" />
                  
                  <rect x="160" y="140" width="80" height="120" rx="12" fill="currentColor" opacity="0.05" />
                  <rect x="170" y="150" width="60" height="100" rx="8" fill="url(#heroGradient)" />
                  <circle cx="200" cy="235" r="5" fill="var(--bg-primary)" />
                  
                  {/* Connection Lines */}
                  <path d="M200 100 C200 50, 100 50, 100 100" stroke="var(--color-primary-400)" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M200 300 C200 350, 300 350, 300 300" stroke="var(--color-accent-400)" strokeWidth="2" strokeDasharray="4 4" />
                  
                  <defs>
                    <linearGradient id="heroGradient" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                      <stop stopColor="var(--color-primary-500)" />
                      <stop offset="1" stopColor="var(--color-accent-500)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────── */}
      <section className="py-24 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How FoundIt Works</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Our secure matching engine and verification process ensures items get back to their rightful owners safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] relative group hover:border-[var(--color-primary-400)] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Post Listing</h3>
              <p className="text-[var(--text-secondary)]">Quickly create a detailed listing for an item you lost or found. Add photos and location markers to help with the search.</p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] relative group hover:border-[var(--color-accent-400)] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-100)] text-[var(--color-accent-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Verify Ownership</h3>
              <p className="text-[var(--text-secondary)]">
                Our claim system requires the claimant to provide specific, non-public details about the item to prove it&apos;s theirs.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] relative group hover:border-[var(--color-secondary-400)] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Safe Return</h3>
              <p className="text-[var(--text-secondary)]">
                Use our secure, anonymous messaging system to arrange a safe meetup or delivery without exposing phone numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────── */}
      <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Browse Categories</h2>
              <p className="text-[var(--text-secondary)]">Find items by what they are.</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-2 text-[var(--color-primary-600)] font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {defaultCategories.slice(0, 12).map((category) => (
              <Link 
                key={category.slug} 
                href={`/search?category=${category.slug}`}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-[var(--color-primary-400)] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)] transition-colors">
                  <Search className="w-6 h-6" /> 
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ────────────────────────── */}
      <section className="py-20 bg-[var(--color-primary-900)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary-300)] mb-2">Free to use</div>
              <div className="text-sm font-medium text-white/80">No hidden fees or subscriptions</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary-300)] mb-2">Private Verification</div>
              <div className="text-sm font-medium text-white/80">Claimants prove ownership safely</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary-300)] mb-2">Secure Messaging</div>
              <div className="text-sm font-medium text-white/80">Coordinate returns anonymously</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary-300)] mb-2">Location Based</div>
              <div className="text-sm font-medium text-white/80">Find matches in your local area</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ─── CTA Section ──────────────────────────── */}
      <section className="py-24 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to find what you lost?</h2>
          <p className="text-xl text-[var(--text-secondary)] mb-10">
            Join the community and help reunite lost belongings through FoundIt.
          </p>
          <Link href="/register">
            <Button size="xl" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Create a Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
