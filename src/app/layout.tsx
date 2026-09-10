import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MPT SaaS — Faceless AI Video Generator',
  description: 'Generate faceless AI videos for TikTok, YouTube, and Facebook in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--fg-primary)' }}>
        {children}
      </body>
    </html>
  );
}
