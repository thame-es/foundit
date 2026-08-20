import { requireAuth } from '@/lib/auth/guards';
import Link from 'next/link';
import { PackageSearch, Mail, Settings, LayoutDashboard, Search, Bell } from 'lucide-react';
import { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Claims', href: '/dashboard/claims', icon: PackageSearch },
    { name: 'Messages', href: '/dashboard/messages', icon: Mail },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
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
          <h2 className="text-xl font-bold truncate">Welcome back,</h2>
          <p className="text-[var(--text-secondary)] truncate">{user.displayName}</p>
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
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
