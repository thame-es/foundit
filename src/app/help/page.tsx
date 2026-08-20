import { Metadata } from 'next';
import { Search, HelpCircle, MessageSquare, Book, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help & FAQ | FoundIt',
  description: 'Get help with using FoundIt and read frequently asked questions.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] pb-20">
      {/* Hero Section */}
      <section className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold mb-6">How can we help you?</h1>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or FAQs..." 
              className="w-full pl-12 pr-4 py-4 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] shadow-sm text-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-14 h-14 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">Getting Started</h3>
            <p className="text-[var(--text-secondary)] text-sm">Learn how to report lost items and search for things you've found.</p>
          </div>

          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-14 h-14 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">Trust & Safety</h3>
            <p className="text-[var(--text-secondary)] text-sm">Read our guidelines for meeting up safely and verifying ownership.</p>
          </div>

          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-14 h-14 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">Contact Support</h3>
            <p className="text-[var(--text-secondary)] text-sm">Need direct assistance? Get in touch with our support team.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-primary)] shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-primary-600)]" />
              How do I verify someone actually owns the item?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              When reporting a found item, keep a specific detail secret (like the lock screen wallpaper, a specific scratch, or the exact contents of a wallet). When someone claims the item, ask them to provide this detail to prove ownership.
            </p>
          </div>

          <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-primary)] shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-primary-600)]" />
              Is there a fee to use FoundIt?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              Posting and searching for items is completely free. We do not charge fees for basic usage. In some regions, we may offer a premium "Recovery Guarantee" delivery service for a small fee.
            </p>
          </div>

          <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-primary)] shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-primary-600)]" />
              What should I do if my lost item is found?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              Once you've safely recovered your item, please go to your Dashboard, locate the active listing under "My Listings", and mark it as "Resolved". This helps keep the platform clean for other users.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Temporary ShieldCheck icon since it wasn't imported at top
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
