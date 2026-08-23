import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeaderBadges } from '@/components/layout/HeaderBadges';
import { NavigationProgress } from '@/components/NavigationProgress';
import { getCurrentUser } from '@/lib/auth/session';
import { appConfig } from '@/lib/config';

// Using system font stack for reproducible builds without external requests

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${appConfig.name}`,
    default: `${appConfig.name} - ${appConfig.tagline}`,
  },
  description: 'The secure and modern lost and found platform. Post lost items, find what you\'re looking for, and safely return items to their owners.',
  keywords: ['lost and found', 'lost property', 'find items', 'lost keys', 'lost wallet', 'secure return'],
  authors: [{ name: appConfig.name }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only await the fast session check — no DB queries blocking the render
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <Header user={user} />
            {/* Stream badge counts in parallel — doesn't block page render */}
            <Suspense fallback={null}>
              <HeaderBadges />
            </Suspense>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
