'use client';

// ===========================================
// FoundIt — Header / Navigation
// ===========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, Plus, Bell, MessageSquare, User,
  LayoutDashboard, Sun, Moon, LogOut, ChevronDown,
  Shield, HelpCircle, Building2, MapPin
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: {
    userId: string;
    displayName: string;
    role: string;
    avatar?: string;
  } | null;
  notificationCount?: number;
  messageCount?: number;
}

const navLinks = [
  { href: '/search', label: 'Search All', icon: Search },
  { href: '/search?type=lost', label: 'Lost Items', icon: MapPin },
  { href: '/search?type=found', label: 'Found Items', icon: MapPin },
  { href: '/how-it-works', label: 'How It Works', icon: HelpCircle },
  { href: '/safety', label: 'Safety', icon: Shield },
  { href: '/for-businesses', label: 'For Businesses', icon: Building2 },
];

export function Header({ user, notificationCount: initialNotifCount = 0, messageCount: initialMsgCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(initialNotifCount);
  const [messageCount, setMessageCount] = useState(initialMsgCount);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // Listen for streamed badge count updates
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setNotificationCount(detail.notificationCount ?? 0);
        setMessageCount(detail.messageCount ?? 0);
      }
    };
    window.addEventListener('header-badges-update', handler);
    return () => window.removeEventListener('header-badges-update', handler);
  }, []);

  const typeParam = searchParams.get('type');
  const currentPathWithParams = typeParam ? `${pathname}?type=${typeParam}` : pathname;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 4).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  currentPathWithParams === link.href
                    ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* More dropdown for additional links */}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-1">
                More <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 mt-1 w-48 py-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {navLinks.slice(4).map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/help"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Post Item Button */}
                <Link href="/report" className="hidden sm:block">
                  <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                    Post an Item
                  </Button>
                </Link>

                {/* Notifications */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>

                {/* Messages */}
                <Link
                  href="/dashboard/messages"
                  className="relative p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  aria-label={`Messages${messageCount > 0 ? ` (${messageCount} unread)` : ''}`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {messageCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[var(--color-primary-600)] text-white rounded-full flex items-center justify-center">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-white text-sm font-semibold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 py-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-xl z-20"
                        >
                          <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{user.displayName}</p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Member</p>
                          </div>
                          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" onClick={() => setUserMenuOpen(false)}>
                            <User className="w-4 h-4" /> Profile & Settings
                          </Link>
                          {user.role === 'admin' && (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-accent-600)] hover:bg-[var(--bg-tertiary)]" onClick={() => setUserMenuOpen(false)}>
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <div className="border-t border-[var(--border-primary)] mt-1 pt-1">
                            <form action="/api/auth/logout" method="POST">
                              <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--bg-tertiary)] w-full text-left">
                                <LogOut className="w-4 h-4" /> Sign Out
                              </button>
                            </form>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-[var(--border-primary)]"
            >
              <div className="py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      currentPathWithParams === link.href
                        ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help
                </Link>

                <div className="pt-3 border-t border-[var(--border-primary)] space-y-2">
                  {user ? (
                    <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                      <Button fullWidth icon={<Plus className="w-4 h-4" />}>Post an Item</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" fullWidth>Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button fullWidth>Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
