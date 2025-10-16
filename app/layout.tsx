import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Basement - Retro Web3 Arcade',
  description: 'Retro Web3 Arcade on Base Network with Anonymous Forum',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body>
        <Providers cookies={cookies}>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

