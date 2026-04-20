import type { ProductType } from '@/types';

export const STORE_CONFIG = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'WEARADORA',
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Adorned in Artistry',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923122624846',
  phoneDisplay: '0312 2624846',
  email: 'hello@wearadora.com',
  location: 'Karachi, Pakistan',
  deliveryFee: 300,
  freeDeliveryMinItems: 2,
  deliveryDays: '2–3 days',
} as const;

export const getDeliveryFee = (itemCount: number): number =>
  itemCount >= STORE_CONFIG.freeDeliveryMinItems ? 0 : STORE_CONFIG.deliveryFee;

export const JEWELRY_CATEGORIES = [
  'Necklace',
  'Ring',
  'Earring',
  'Bracelet',
  'Bangle',
  'Anklet',
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

export const CATEGORY_IMAGES: Record<string, string> = {
  Slides: '/images/main-WA-1-black-card-img.png',
  Heels: '/images/remove.photos-removed-background-7.png',
  Sandal: '/images/remove.photos-removed-background-9.png',
  Necklace: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
  Ring: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
  Earring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
  Bracelet: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
};

export const getProductType = (category?: string): ProductType => {
  if (!category) return 'jewelry';
  return (SLIPPERS_CATEGORIES as readonly string[]).includes(category)
    ? 'slippers'
    : 'jewelry';
};
