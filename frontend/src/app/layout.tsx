import type { Metadata, Viewport } from 'next';
import { Fraunces, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const sans = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono', display: 'swap' });

const SITE_URL = 'https://sentinel-x-sayan1-dls-projects.vercel.app';
const TITLE = 'Sentinel-X — follow the money, catch the lie';
const DESCRIPTION =
  'A fraud-watching console built by Sayan Bhattacharya. It follows money across accounts, scores every move and keeps a paper trail you can actually read.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · Sentinel-X' },
  description: DESCRIPTION,
  authors: [{ name: 'Sayan Bhattacharya', url: 'https://github.com/SayAn1-dls' }],
  creator: 'Sayan Bhattacharya',
  alternates: { canonical: SITE_URL },
  openGraph: { type: 'website', url: SITE_URL, siteName: 'Sentinel-X', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: '#0E0D0B', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-ink text-paper min-h-screen antialiased grain">{children}</body>
    </html>
  );
}
