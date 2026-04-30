import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Handcrafted Jewelry — Necklaces, Rings, Earrings & Bangles',
  description:
    'Heritage-inspired necklaces, rings, earrings and bangles — handcrafted in Karachi. Free delivery on 2+ items, nationwide in 2–3 days.',
  alternates: { canonical: '/jewelry' },
  openGraph: {
    title: `Handcrafted Jewelry | ${STORE_CONFIG.name}`,
    description:
      'Timeless pieces that tell a story — refined elegance, heritage craftsmanship.',
    url: `${STORE_CONFIG.siteUrl}/jewelry`,
    type: 'website',
  },
};

export default function JewelryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
