import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s | WEARADORA" template so the
  // brand appears once, as the proper "Wear Adora" name for search.
  title: {
    absolute: `Ladies Shoes Online in Pakistan — Heels, Slides, Sandals & Flats | ${STORE_CONFIG.brandName}`,
  },
  description:
    'Buy handcrafted ladies shoes online in Pakistan — heels, slides, sandals & flats from Rs. 1,700, made in Karachi. Cash on delivery, free delivery over Rs. 3,000, 7-day exchange.',
  keywords: [
    'ladies shoes online Pakistan',
    'ladies footwear Pakistan',
    'women shoes online Pakistan',
    'heels online Pakistan',
    'block heels Pakistan',
    'kitten heels',
    'party wear heels',
    'bridal heels Pakistan',
    'wedding shoes Pakistan',
    'flats for women',
    'sandals for women Pakistan',
    'slides for women',
    'khussa online Pakistan',
    'handmade shoes Karachi',
  ],
  alternates: { canonical: '/slippers' },
  openGraph: {
    title: `Ladies Shoes Online in Pakistan | ${STORE_CONFIG.brandName}`,
    description:
      'Handcrafted heels, slides, sandals and flats made in Karachi. Cash on delivery nationwide, free delivery over Rs. 3,000, 7-day exchange.',
    url: `${STORE_CONFIG.siteUrl}/slippers`,
    type: 'website',
  },
};

export default function SlippersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
