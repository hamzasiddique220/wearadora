import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shop All — Shoes & Jewellery',
  description: `Browse the complete ${STORE_CONFIG.name} collection — handcrafted slides, heels, sandals and timeless jewellery. Free delivery on orders Rs 4,500+, nationwide in ${STORE_CONFIG.deliveryDays}.`,
  alternates: { canonical: '/shop' },
  openGraph: {
    title: `Shop All | ${STORE_CONFIG.name}`,
    description: `${STORE_CONFIG.tagline} · Handcrafted shoes & jewellery collection.`,
    url: `${STORE_CONFIG.siteUrl}/shop`,
    type: 'website',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
