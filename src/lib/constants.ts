import type { ProductType } from '@/types';

/**
 * The ONE customer phone number — calls and WhatsApp, available 24/7.
 * Deliberately NOT overridable by env: production previously had
 * NEXT_PUBLIC_WHATSAPP_NUMBER set to a different number (+923111217189),
 * so every wa.me / tel: link silently pointed elsewhere while the visible
 * text said 0313 2166431. Change it here and only here.
 */
export const CONTACT_PHONE = {
  /** wa.me format — digits only, country code, no + */
  digits: '923132166431',
  /** tel: links and schema telephone */
  e164: '+923132166431',
  /** schema.org-friendly dashed form */
  dashed: '+92-313-2166431',
  /** local display */
  display: '0313 2166431',
  /** international display */
  international: '+92 313 2166431',
  availability: 'Available 24/7 on call and WhatsApp',
} as const;

/**
 * Delivery times — source of truth is the shipping page policy:
 * Karachi 4–5 working days, rest of Pakistan 6–7 working days.
 * Urgent (online payment only): Karachi 1, Punjab 2 working days.
 */
export const DELIVERY_TIMES = {
  karachi: { min: 4, max: 5 },
  restOfPakistan: { min: 6, max: 7 },
  urgent: { karachi: 1, punjab: 2 },
} as const;

const range = (r: { min: number; max: number }) => `${r.min}–${r.max}`;

export const DELIVERY_TEXT = {
  karachi: `${range(DELIVERY_TIMES.karachi)} working days`,
  restOfPakistan: `${range(DELIVERY_TIMES.restOfPakistan)} working days`,
  /** Full sentence fragment for FAQs / footers. */
  summary: `${range(DELIVERY_TIMES.karachi)} working days in Karachi, ${range(DELIVERY_TIMES.restOfPakistan)} working days elsewhere in Pakistan`,
  /** Short nationwide range for tight UI slots (announcement bar, cart). */
  short: `${DELIVERY_TIMES.karachi.min}–${DELIVERY_TIMES.restOfPakistan.max} working days`,
} as const;

export const STORE_CONFIG = {
  // Brand name used everywhere in text — page titles, meta tags, structured
  // data, on-site copy. The header/footer logo is a separate design asset
  // (wearadora-wordmark-*.png) and keeps its stylised all-caps "WEARADORA"
  // look regardless of this value.
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'Wear Adora',
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Adorned in Artistry',
  whatsappNumber: CONTACT_PHONE.digits,
  phoneDisplay: CONTACT_PHONE.display,
  email: 'info@wearadora.com',
  location: 'Karachi, Pakistan',
  deliveryFee: 250,
  freeDeliveryMinTotal: 4500,
  /** Short nationwide range ("4–7 working days"). Prefer DELIVERY_TEXT.summary
   *  wherever there's room for the Karachi / rest-of-Pakistan split. */
  deliveryDays: DELIVERY_TEXT.short,
  // KEPT IN SYNC BY HAND with the SITE_URL constant at the top of
  // next.config.mjs (same env var, same fallback, same trailing-slash strip)
  // — that file can't import this module, so a change here needs the same
  // change there or the www→apex redirect and this site's canonical URLs
  // will silently disagree.
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://wearadora.com',
} as const;

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/wearadora.pk',
  facebook: 'https://www.facebook.com/share/18hu2xPWS8/',
  tiktok: 'https://www.tiktok.com/@wearadora',
} as const;

/** Free delivery is INCLUSIVE: a subtotal of exactly Rs 4,500 ships free.
 *  firestore.rules (feeOk) hardcodes the same 4500 / 250 — the rules tests
 *  import STORE_CONFIG and fail if the two ever drift apart. */
export const getDeliveryFee = (subtotal: number): number =>
  subtotal >= STORE_CONFIG.freeDeliveryMinTotal ? 0 : STORE_CONFIG.deliveryFee;

/**
 * Order limits enforced by firestore.rules (isValidOrder). Checkout and the
 * cart use the same numbers so a valid customer is never blocked by a rule
 * the UI didn't warn about. Change both together; tests cover each limit.
 */
export const ORDER_LIMITS = {
  /** One catalog price lookup per line; Firestore allows 10 per request. */
  maxLines: 10,
  maxQtyPerLine: 99,
  name: { min: 2, max: 100 },
  address: { min: 3, max: 500 },
  city: { min: 2, max: 80 },
  notes: { max: 1000 },
  phone: { min: 10, max: 20 },
} as const;

/** Keep only the characters the order rule accepts in a phone number. */
export const sanitizePhone = (phone: string): string =>
  phone.replace(/[^0-9+ ()-]/g, '').replace(/\s+/g, ' ').trim().slice(0, ORDER_LIMITS.phone.max);

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

export const SLIPPER_SIZES = [5, 6, 7, 8, 9, 10, 11, 12] as const;

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
  // Jewellery variations
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
