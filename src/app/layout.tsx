import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SENTINEL-X | Forensic Guard Platform',
  description: 'Institutional-grade AI-powered forensic transaction monitoring and threat intelligence platform.',
  keywords: ['forensic', 'threat intelligence', 'transaction monitoring', 'AML', 'compliance'],
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black min-h-screen scanline antialiased`}>
        <AuthProvider>
          <div className="relative z-10">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
