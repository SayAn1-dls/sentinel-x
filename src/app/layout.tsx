import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SENTINEL-X | Forensic Guard Platform',
  description: 'Institutional-grade AI-powered forensic transaction monitoring and threat intelligence platform.',
  keywords: ['forensic', 'threat intelligence', 'transaction monitoring', 'AML', 'compliance'],
  authors: [{ name: 'SayAn1-dls' }],
  themeColor: '#FF6B00',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-black min-h-screen scanline antialiased`}>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
