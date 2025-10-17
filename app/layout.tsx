import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
// Providers disabled - arcade games use HTML files with CDN libraries
// import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Basement - Retro Web3 Arcade',
  description: 'Retro Web3 Arcade on Base Network with Anonymous Forum',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

