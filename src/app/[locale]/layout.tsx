import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeaderBadges } from '@/components/layout/HeaderBadges';
import { NavigationProgress } from '@/components/NavigationProgress';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/session';
import { appConfig } from '@/lib/config';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Initialize Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Provide messages to the client
  const messages = await getMessages();

  // Only await the fast session check — no DB queries blocking the render
  const user = await getCurrentUser();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
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
              <NextIntlClientProvider messages={messages}>
                {children}
              </NextIntlClientProvider>
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
