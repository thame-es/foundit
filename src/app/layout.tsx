import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { appConfig } from '@/lib/config';

// Initialize Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  let notificationCount = 0;
  let messageCount = 0;

  if (user) {
    try {
      // Get unread notifications
      notificationCount = await db.notification.count({
        where: { userId: user.userId, readAt: null },
      });

      // Get unread messages in active conversations
      // We count messages where we are NOT the sender, and the message hasn't been read
      const unreadMessages = await db.message.count({
        where: {
          senderId: { not: user.userId },
          readAt: null,
          conversation: {
            OR: [
              { user1Id: user.userId },
              { user2Id: user.userId },
            ],
            status: 'active',
          },
        },
      });
      messageCount = unreadMessages;
    } catch (e) {
      // Ignore DB errors during layout render if DB isn't fully ready
      console.error('Error fetching layout badges:', e);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <ToastProvider>
            <Header user={user} notificationCount={notificationCount} messageCount={messageCount} />
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
