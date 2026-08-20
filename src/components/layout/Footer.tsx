'use client';

// ===========================================
// FoundIt — Footer Component
// ===========================================

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { appConfig } from '@/lib/config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xs">
              {appConfig.tagline} We connect people who found items with the people who lost them.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/search" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Find an Item</Link></li>
              <li><Link href="/search?type=lost" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Lost Items</Link></li>
              <li><Link href="/search?type=found" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Found Items</Link></li>
              <li><Link href="/report" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Post an Item</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How It Works</Link></li>
              <li><Link href="/safety" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Safety Center</Link></li>
              <li><Link href="/for-businesses" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">For Businesses</Link></li>
              <li><Link href="/help" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-tertiary)]">
            &copy; {currentYear} {appConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
