import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://sentinel-x-sayan1-dls-projects.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SENTINEL-X | Real-Time Financial Threat Detection',
    template: '%s | SENTINEL-X',
  },
  description:
    'AI-powered fraud detection platform with biometric authentication, real-time transaction analysis, WebAuthn FIDO2 passkeys, and institutional-grade threat intelligence.',
  keywords: [
    'fraud detection',
    'financial threat detection',
    'AML compliance',
    'transaction monitoring',
    'WebAuthn',
    'FIDO2',
    'passkey authentication',
    'biometric security',
    'real-time analytics',
    'anomaly detection',
    'forensic intelligence',
  ],
  authors: [{ name: 'Sayan Bhattacharya', url: 'https://github.com/SayAn1-dls' }],
  creator: 'Sayan Bhattacharya',
  publisher: 'Sentinel-X',
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'SENTINEL-X',
    title: 'SENTINEL-X | Real-Time Financial Threat Detection',
    description:
      'Institutional-grade AI-powered forensic transaction monitoring, biometric WebAuthn passkeys, and real-time threat intelligence.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Sentinel-X — Real-Time Financial Threat Detection Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SENTINEL-X | Real-Time Financial Threat Detection',
    description:
      'AI-powered fraud detection with biometric authentication and real-time transaction analysis.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@SayAn1_dls',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0A0F1E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-[#0A0F1E] min-h-screen scanline antialiased`}>
        <AuthProvider>
          <div className="relative z-10">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
