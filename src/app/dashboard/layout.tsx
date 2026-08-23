import { requireAuth } from '@/lib/auth/guards';
import Link from 'next/link';
import { PackageSearch, Mail, Settings, LayoutDashboard, Search, Bell } from 'lucide-react';
import { ReactNode } from 'react';
import { db } from '@/lib/db';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { displayName: true, emailVerified: true }
  });

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Possible Matches', href: '/dashboard/matches', icon: Search },
    { name: 'My Claims', href: '/dashboard/claims', icon: PackageSearch },
    { name: 'Messages', href: '/dashboard/messages', icon: Mail },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Saved Searches', href: '/dashboard/saved-searches', icon: Search },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col md:flex-row">
      {/* Mobile Nav */}
      <div className="md:hidden bg-[var(--bg-primary)] border-b border-[var(--border-primary)] p-4 flex overflow-x-auto gap-4">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] whitespace-nowrap"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-primary)] border-r border-[var(--border-primary)] p-6 min-h-[calc(100vh-64px)]">
        <div className="mb-8">
          <h2 className="text-lg font-bold">Welcome back,</h2>
          <p className="text-sm text-[var(--text-secondary)] break-words">{user?.displayName}</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-colors font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {user && !user.emailVerified && <VerificationBanner />}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
