export type ProductType = 'jewelry' | 'slippers';

/**
 * Jewelry material, set explicitly per product — never inferred from name or
 * appearance. Drives the "is this real gold / is this zircon" answer in
 * ProductFaq and the material claims allowed in SEO copy/keywords for that
 * product. Unset means only the generic "artificial/fashion jewelry, gold-tone
 * finish" claim is safe to make.
 */
export type ProductMaterial = 'Artificial' | 'Zircon' | 'Crystal';

export type ProductCategory =
  | 'Necklace'
  | 'Ring'
  | 'Earring'
  | 'Bangles'
  | 'Anklet'
  | 'Sandal'
  | 'Khussa';

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  category: ProductCategory | string;
  productType?: ProductType;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  slideImages?: string[];
  /** Map of color name → image URL. Lets each color show its own image. */
  colorImages?: Record<string, string>;
  description: string;
  /** Legacy flat size list — only used when `colors` is empty. Once a
   *  product has colors, size availability comes from `variantStock`
   *  instead (this field is ignored/cleared in that case). */
  sizes?: number[];
  colors?: string[];
  /** Per (color, size) stock count, keyed by `variantKey(color, size)` — see
   *  src/lib/variants.ts. Only populated for slipper products with colors.
   *  A key present (even at 0) means that size is offered for that color;
   *  no key means it isn't. `stock` is the auto-computed sum of this map
   *  whenever it's in use. */
  variantStock?: Record<string, number>;
  isNew?: boolean;
  tag?: string;
  /** Jewelry only. See ProductMaterial — unset/null if not confirmed. */
  material?: ProductMaterial | null;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: number;
  selectedColor?: string;
  cartLineId: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  mapLink?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  dateDisplay: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  /** Snapshot of the product name at submission time, for admin display without a join. */
  productName?: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  /** Admin-controlled — this app has no accounts/orders keyed by identity, so
   *  "verified purchase" can't be auto-detected and is a manual admin toggle. */
  verified?: boolean;
  featured?: boolean;
  source: 'customer' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error';
}

export interface HeroSlideOverride {
  image: string;
  bg?: string;
  eyebrow: string;
  title: string;
  italic: string;
  tail?: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  kind: 'shoe' | 'jewel';
}

export interface CategoryHeroOverride {
  image: string;
  kind?: 'photo' | 'product';
}

export interface SiteSettings {
  heroSlides?: HeroSlideOverride[];
  categoryImages?: Record<string, string>;
  storyImage?: string;
  jewelryHero?: CategoryHeroOverride;
  slippersHero?: CategoryHeroOverride;
  /** Master switch — when false, all jewelry pages, links, and products are hidden from the public site. */
  jewelryEnabled?: boolean;
  updatedAt?: string;
}
