import type { Metadata } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s | WEARADORA" template so the
  // proper "Wear Adora" name appears once.
  title: {
    absolute: `Artificial Jewellery Online in Pakistan — Necklace Sets, Earrings & Bracelets | ${STORE_CONFIG.brandName}`,
  },
  description: `Buy artificial jewellery online in Pakistan — zircon (American diamond) necklace sets, bridal chokers, earrings and bracelets from Rs. 449. Cash on delivery, free delivery over Rs. 3,000, 7-day exchange, nationwide in ${STORE_CONFIG.deliveryDays}.`,
  keywords: [
    'artificial jewellery',
    'artificial jewellery Pakistan',
    'artificial jewellery online',
    'american diamond jewellery',
    'zircon jewellery',
    'zircon necklace set',
    'wedding jewellery Pakistan',
    'party wear jewellery',
    'jewellery set online',
    'choker set price in Pakistan',
    'bridal choker set',
    'best artificial jewellery online',
  ],
  alternates: { canonical: '/jewelry' },
  openGraph: {
    title: `Artificial Jewellery Online in Pakistan | ${STORE_CONFIG.brandName}`,
    description:
      'Zircon (American diamond) necklace sets, bridal chokers, earrings and bracelets from Rs. 449 — handcrafted, with free delivery on orders Rs 3,000+ across Pakistan.',
    url: `${STORE_CONFIG.siteUrl}/jewelry`,
    type: 'website',
  },
};

export default function JewelryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
