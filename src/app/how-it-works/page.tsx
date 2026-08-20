import { Metadata } from 'next';
import { Shield, CheckCircle, Search, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'How It Works | FoundIt',
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6 text-center">How FoundIt Works</h1>
      <p className="text-xl text-[var(--text-secondary)] text-center mb-16 max-w-2xl mx-auto">
        We've built a secure, zero-cost platform to help reunite people with their lost belongings through community cooperation.
      </p>

      <div className="space-y-16">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">1. Report Lost or Found Items</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              If you lose something, you can post a detailed report with pictures, exact location, and identifying features. 
              If you find something, you post a secure report—withholding key identifying details—to prevent false claims.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 bg-[var(--color-accent-100)] text-[var(--color-accent-600)] rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">2. Smart Matching & Searching</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Our platform allows you to search across your local area. The system categorizes items and uses time/location to help narrow down potential matches between lost reports and found reports.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">3. Verify Ownership Securely</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              When someone believes an item is theirs, they submit a private "Verification Proof" describing unique features of the item (e.g. wallpaper on a phone, a specific scratch). The finder reviews this proof and can safely approve or reject the claim.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">4. Safe Return</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Once a claim is approved, our secure messaging system opens a private chat between the claimant and finder. You can safely coordinate a meetup without ever exposing your phone number or email.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center bg-[var(--bg-secondary)] p-12 rounded-3xl border border-[var(--border-primary)]">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Create Account</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">Search Items</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
