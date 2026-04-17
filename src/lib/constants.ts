export const STORE_CONFIG = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'WEARADORA',
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Adorned in Artistry',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923112032415',
  email: 'hello@wearadora.com',
  location: 'Karachi, Pakistan',
  freeDeliveryAbove: 5000,
} as const;

export const PRODUCT_CATEGORIES = [
  'Necklace',
  'Ring',
  'Earring',
  'Bracelet',
  'Bangle',
  'Anklet',
  'Sandal',
  'Khussa',
] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'completed',
  'cancelled',
] as const;

export const CATEGORY_IMAGES: Record<string, string> = {
  Necklace: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
  Ring: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
  Earring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
  Bracelet: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
  Sandal: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800',
  Khussa: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
};
