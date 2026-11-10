import { getProductType } from './constants';
import type { Product } from '@/types';

export interface SizeRange {
  min: number;
  max: number;
}

/**
 * Smallest → largest shoe size offered across the footwear catalog.
 * A size counts as offered when it's a key in variantStock (even at 0 stock —
 * see Product.variantStock) or, for products without colors, in the legacy
 * `sizes` list. Returns null when no footwear has sizes.
 */
export function getFootwearSizeRange(products: Product[]): SizeRange | null {
  const sizes: number[] = [];
  for (const p of products) {
    if ((p.productType || getProductType(p.category as string)) !== 'slippers') continue;
    const fromVariants = Object.keys(p.variantStock || {})
      .map((k) => Number(k.split('__').pop()))
      .filter(Number.isFinite);
    const list = fromVariants.length > 0 ? fromVariants : (p.sizes || []).map(Number);
    for (const n of list) if (Number.isFinite(n) && n > 0) sizes.push(n);
  }
  if (sizes.length === 0) return null;
  return { min: Math.min(...sizes), max: Math.max(...sizes) };
}
