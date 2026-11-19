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
import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { getPriceRange, visibleProducts } from '@/lib/priceRange';

// Only the weights actually used on first paint are preloaded — fewer
// font files = much smaller LCP. Other weights are inlined via system
// fallback (display: swap) or filled in by font synthesis.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
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

  // Both footwear and jewellery are handcrafted; jewellery is American diamond.
  const headline = jewelryEnabled
    ? 'Handcrafted Shoes & American Diamond Jewellery'
    : 'Handcrafted Ladies Footwear';
  const defaultTitle = jewelryEnabled
    ? `${STORE_CONFIG.name} | ${headline}`
    : `${STORE_CONFIG.name} — ${headline} in Pakistan`;

  const description = jewelryEnabled
    ? `Wear Adora — handcrafted heels, sandals and slides made in Karachi, and handcrafted American diamond jewellery. Cash on delivery across Pakistan, free delivery on Rs 4,500+.`
    : `Wear Adora — 40+ years of handcrafted ladies footwear. Heels, sandals and slides made in Karachi. Cash on delivery across Pakistan, free delivery on Rs 4,500+.`;

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
    ? 'Handcrafted ladies shoes (40+ years of craft) and handcrafted American diamond jewellery.'
    : 'Handcrafted ladies shoes. 40+ years of artisan experience.';

  return {
    metadataBase: new URL(STORE_CONFIG.siteUrl),
    title: {
      default: defaultTitle,
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
      description: `${STORE_CONFIG.tagline} · 40+ years of craft · Free delivery on orders Rs 4,500+.`,
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
    verification: {
  google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  other: {
    "p:domain_verify": "65b9cdbf475be1b6c4ceaefddcbfa0d7",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetched on the server so nav/footer can render the correct set of
  // links in the initial HTML — otherwise the /jewelry link only appears
  // after client-side store hydration, which loses SEO + first-paint UX.
  // fetchAllProducts is a cached fetch (revalidate 600), deduped with the
  // page's own call — used only for the schema's live price range.
  const [settings, products] = await Promise.all([
    fetchSiteSettings(),
    fetchAllProducts(),
  ]);
  const initialJewelryEnabled = settings?.jewelryEnabled === true;
  const priceRange = getPriceRange(visibleProducts(products, initialJewelryEnabled));

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${cormorantItalic.variable} ${italiana.variable} ${arsenal.variable}`}
    >
      <head>
        {/* Preconnect to origins that block the LCP path — image CDN and
            the deferred pixel scripts. Warming these TCP/TLS handshakes
            early trims a few hundred ms off first paint on mobile. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-charcoal focus:text-cream focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <OrganizationJsonLd
          jewelryEnabled={initialJewelryEnabled}
          priceRange={priceRange}
        />
        <Analytics />
        <StorageHydrator />
        <ScrollProgress />
        <AnnouncementBar sale={settings?.sale} />
        <Header initialJewelryEnabled={initialJewelryEnabled} />
        <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
          {children}
        </main>
        <Footer initialJewelryEnabled={initialJewelryEnabled} />
        <Toast />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
