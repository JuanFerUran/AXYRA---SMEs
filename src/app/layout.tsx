import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'BIA Platform - Business Intelligence & Automation',
  description: 'Platform for SMEs Business Intelligence and Automation',
};

import { AuthGuard } from '@/components/auth/auth-guard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <AuthGuard>
            <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthGuard>
        </TooltipProvider>
      </body>
    </html>
  );
}
