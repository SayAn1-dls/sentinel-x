import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SENTINEL-X | Forensic Guard Platform',
  description: 'Institutional-grade AI-powered forensic transaction monitoring and threat intelligence platform.',
  keywords: ['forensic', 'threat intelligence', 'transaction monitoring', 'AML', 'compliance'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black min-h-screen scanline`}>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
