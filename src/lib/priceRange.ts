import { getProductType } from './constants';
import { formatPrice } from './utils';
import type { Product } from '@/types';

export interface PriceRange {
  min: number;
  max: number;
  count: number;
}

/**
 * Products a shopper can actually see — jewellery is hidden while the admin
 * toggle is off. Same rule as the home page, sitemap and product pages.
 */
export function visibleProducts(products: Product[], jewelryEnabled: boolean): Product[] {
  return jewelryEnabled
    ? products
    : products.filter(
        (p) => (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );
}

/**
 * Min/max selling price across the live catalog. Single source for the
 * Organization schema and /llms.txt so the two never disagree. Returns null
 * when there are no priced products (e.g. Firestore unreachable at build).
 */
export function getPriceRange(products: Product[]): PriceRange | null {
  const prices = products
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

/** "Rs. 1,450 – Rs. 3,999" (or a single price when min === max). */
export function formatPriceRange(range: PriceRange): string {
  return range.min === range.max
    ? formatPrice(range.min)
    : `${formatPrice(range.min)} – ${formatPrice(range.max)}`;
}
