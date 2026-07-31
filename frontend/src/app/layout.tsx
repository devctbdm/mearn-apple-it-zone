import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { ClientLayout } from './ClientLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const appTitle = 'Apple IT Zone';
const appMainDescription =
  'Experience top-notch Apple repair services at unbeatable prices - online and in-store. From iPhones to Macs, we offer a wide range of services for all your Apple needs.';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appTitle,
  description: appMainDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider>
            <ClientLayout>{children}</ClientLayout>
          </TooltipProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
