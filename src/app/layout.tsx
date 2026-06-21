import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Cormorant_Garamond,
  Cormorant,
  Italiana,
  Arsenal,
} from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import Toast from '@/components/ui/Toast';
import ScrollProgress from '@/components/ui/ScrollProgress';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import Analytics from '@/components/analytics/Analytics';
import StorageHydrator from '@/components/StorageHydrator';
import { STORE_CONFIG, SOCIAL_LINKS } from '@/lib/constants';
import { fetchSiteSettings } from '@/lib/server/firestoreRest';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
});

const cormorantItalic = Cormorant({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-cormorant-italic',
  display: 'swap',
  preload: false,
});

// Brand wordmark — elegant high-fashion serif (per Logo & Brand Guide)
const italiana = Italiana({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-italiana',
  display: 'swap',
  preload: true,
});

// Brand tagline — "Adorned in Artistry"
const arsenal = Arsenal({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-arsenal',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const jewelryEnabled = settings?.jewelryEnabled === true;

  const headline = jewelryEnabled
    ? 'Handcrafted Shoes & Jewelry'
    : 'Handcrafted Ladies Footwear';

  const description = jewelryEnabled
    ? `WEARADORA — 40+ years of handcrafted ladies footwear and jewelry. Slides, heels, sandals and timeless jewelry made in Karachi. Free delivery on 2+ items, nationwide in ${STORE_CONFIG.deliveryDays}.`
    : `WEARADORA — 40+ years of handcrafted ladies footwear. Slides, heels and sandals made in Karachi. Free delivery on 2+ items, nationwide in ${STORE_CONFIG.deliveryDays}.`;

  const baseKeywords = [
    'wearadora',
    'ladies shoes Pakistan',
    'handcrafted footwear',
    'slides',
    'heels',
    'sandals',
    'Karachi',
    'Pakistani shoes',
  ];
  const keywords = jewelryEnabled
    ? [
        ...baseKeywords,
        'jewelry',
        'necklaces',
        'rings',
        'earrings',
        'bangles',
      ]
    : baseKeywords;

  const twitterDescription = jewelryEnabled
    ? 'Handcrafted ladies shoes and jewelry. 40+ years of artisan experience.'
    : 'Handcrafted ladies shoes. 40+ years of artisan experience.';

  return {
    metadataBase: new URL(STORE_CONFIG.siteUrl),
    title: {
      default: `${STORE_CONFIG.name} — ${headline} | ${STORE_CONFIG.tagline}`,
      template: `%s | ${STORE_CONFIG.name}`,
    },
    description,
    keywords,
    authors: [{ name: STORE_CONFIG.name, url: STORE_CONFIG.siteUrl }],
    creator: STORE_CONFIG.name,
    publisher: STORE_CONFIG.name,
    applicationName: STORE_CONFIG.name,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `${STORE_CONFIG.name} — ${headline}`,
      description: `${STORE_CONFIG.tagline} · 40+ years of craft · Free delivery on 2+ items.`,
      siteName: STORE_CONFIG.name,
      url: STORE_CONFIG.siteUrl,
      type: 'website',
      locale: 'en_PK',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`,
      description: twitterDescription,
      images: ['/opengraph-image'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: false,
    },
    other: {
      'og:see_also': [
        SOCIAL_LINKS.instagram,
        SOCIAL_LINKS.facebook,
        SOCIAL_LINKS.tiktok,
      ].join(','),
    },
  };
}

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
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${cormorantItalic.variable} ${italiana.variable} ${arsenal.variable}`}
    >
      <body>
        <OrganizationJsonLd />
        <Analytics />
        <StorageHydrator />
        <ScrollProgress />
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toast />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
