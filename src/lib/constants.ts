import type { ProductType } from '@/types';

export const STORE_CONFIG = {
  // Visual wordmark shown on the site (header/footer). Stays as the stylised
  // all-caps "WEARADORA".
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'WEARADORA',
  // Proper brand name used in structured data (JSON-LD) and og:site_name so
  // Google's site name and Facebook shares display "Wear Adora". Not shown as
  // a visible wordmark — that's `name` above.
  brandName: 'Wear Adora',
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Adorned in Artistry',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923132166431',
  phoneDisplay: '0313 2166431',
  email: 'info@wearadora.com',
  location: 'Karachi, Pakistan',
  deliveryFee: 250,
  freeDeliveryMinTotal: 4500,
  deliveryDays: '4–5 days',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://wearadora.com',
} as const;

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/wearadora.pk',
  facebook: 'https://www.facebook.com/share/18hu2xPWS8/',
  tiktok: 'https://www.tiktok.com/@wearadora',
} as const;

export const getDeliveryFee = (subtotal: number): number =>
  subtotal >= STORE_CONFIG.freeDeliveryMinTotal ? 0 : STORE_CONFIG.deliveryFee;

export const JEWELRY_CATEGORIES = [
  'Necklace',
  'Ring',
  'Earring',
  'Bangles',
  'Anklet',
  'Bridal',
] as const;

export const SLIPPERS_CATEGORIES = ['Slides', 'Heels', 'Sandal'] as const;

export const PRODUCT_CATEGORIES = [
  ...JEWELRY_CATEGORIES,
  ...SLIPPERS_CATEGORIES,
] as const;

export const SLIPPER_SIZES = [6, 7, 8, 9, 10, 11] as const;

export const DEFAULT_SLIPPER_COLORS = [
  'Black',
  'Gold',
  'Golden',
  'Silver',
  'Beige',
  'Nude',
  'Tan',
  'Ash',
  'Brown',
  'Red',
  'Maroon',
  'White',
] as const;

export const COLOR_HEX: Record<string, string> = {
  Black: '#1a1614',
  Gold: '#d4af37',
  Golden: '#d4af37',
  Silver: '#c0c0c0',
  Beige: '#e8ddc7',
  Nude: '#e3c9b7',
  Tan: '#c9a27d',
  Ash: '#b5b0a8',
  Brown: '#6b4423',
  Red: '#c94b4b',
  Maroon: '#800000',
  White: '#ffffff',
};

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'completed',
  'cancelled',
] as const;

export const getProductType = (category?: string): ProductType => {
  if (!category) return 'jewelry';
  const normalized = normalizeCategory(category);
  return (SLIPPERS_CATEGORIES as readonly string[]).includes(normalized)
    ? 'slippers'
    : 'jewelry';
};

const CATEGORY_ALIASES: Record<string, string> = {
  // Jewelry variations
  bracelet: 'Bangles',
  bracelets: 'Bangles',
  bangle: 'Bangles',
  bangles: 'Bangles',
  necklace: 'Necklace',
  necklaces: 'Necklace',
  ring: 'Ring',
  rings: 'Ring',
  earring: 'Earring',
  earrings: 'Earring',
  anklet: 'Anklet',
  anklets: 'Anklet',
  bridal: 'Bridal',
  'bridal set': 'Bridal',
  'bridal sets': 'Bridal',
  // Slipper variations
  slide: 'Slides',
  slides: 'Slides',
  slipper: 'Slides',
  slippers: 'Slides',
  khussa: 'Slides',
  khussas: 'Slides',
  heel: 'Heels',
  heels: 'Heels',
  sandal: 'Sandal',
  sandals: 'Sandal',
};

export const normalizeCategory = (category?: string): string => {
  if (!category) return '';
  const trimmed = category.trim();
  if (!trimmed) return '';
  return CATEGORY_ALIASES[trimmed.toLowerCase()] || trimmed;
};
