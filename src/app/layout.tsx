import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Toast from '@/components/ui/Toast';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `${STORE_CONFIG.name} — Handcrafted Shoes & Jewelry | ${STORE_CONFIG.tagline}`,
    template: `%s | ${STORE_CONFIG.name}`,
  },
  description:
    'WEARADORA — 40+ years of handcrafted ladies footwear and jewelry. Slides, heels, sandals and timeless jewelry made in Karachi. Free delivery on 2+ items, nationwide in 2–3 days.',
  keywords: [
    'wearadora',
    'ladies shoes Pakistan',
    'handcrafted footwear',
    'slides',
    'heels',
    'sandals',
    'jewelry',
    'necklaces',
    'rings',
    'earrings',
    'bracelets',
    'Karachi',
    'Pakistani shoes',
  ],
  authors: [{ name: STORE_CONFIG.name }],
  creator: STORE_CONFIG.name,
  applicationName: STORE_CONFIG.name,
  openGraph: {
    title: `${STORE_CONFIG.name} — Handcrafted Shoes & Jewelry`,
    description: `${STORE_CONFIG.tagline} · 40+ years of craft · Free delivery on 2+ items.`,
    siteName: STORE_CONFIG.name,
    type: 'website',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`,
    description:
      'Handcrafted ladies shoes and jewelry. 40+ years of artisan experience.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1ea' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1614' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ScrollProgress />
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
