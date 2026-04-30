import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shoes Collection — Slides, Heels & Sandals',
  description:
    'Handcrafted slides, heels and sandals — 40+ years of cobbling experience. Comfort and design in a single pair, made in Karachi.',
  alternates: { canonical: '/slippers' },
  openGraph: {
    title: `Shoes Collection | ${STORE_CONFIG.name}`,
    description:
      'Slides, heels and sandals handcrafted in-house — four decades of craft.',
    url: `${STORE_CONFIG.siteUrl}/slippers`,
    type: 'website',
  },
};

export default function SlippersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
