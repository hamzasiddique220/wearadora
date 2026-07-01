import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'American Diamond & Zircon Jewellery — Necklace Sets, Bridal Chokers',
  description: `Handcrafted American diamond (zircon) jewellery — necklace sets, bridal chokers, earrings and bracelets. Free delivery on orders Rs 3,000+, nationwide in ${STORE_CONFIG.deliveryDays}.`,
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
