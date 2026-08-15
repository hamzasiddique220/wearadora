const SEP = '__';

/** Accepts persisted numeric stock (Firestore) or in-progress string values
 *  (admin form inputs, which need to hold raw/empty text while typing). */
type StockValue = number | string;
type StockMap = Record<string, StockValue> | undefined;

const toNum = (v: StockValue | undefined): number => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return typeof n === 'number' && !Number.isNaN(n) && n > 0 ? n : 0;
};

/** Key format for `Product.variantStock` — one stock count per (color, size) pair. */
export const variantKey = (color: string, size: number): string => `${color}${SEP}${size}`;

/**
 * Sizes with a defined variant entry for this color, ascending. A size with a
 * key present (even at 0 stock) is "offered but sold out"; a size with no key
 * at all is not offered for this color.
 */
export const sizesForColor = (variantStock: StockMap, color: string): number[] => {
  if (!variantStock) return [];
  const prefix = `${color}${SEP}`;
  return Object.keys(variantStock)
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(k.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
};

export const stockForVariant = (
  variantStock: StockMap,
  color?: string,
  size?: number
): number => {
  if (!variantStock || !color || size === undefined) return 0;
  return toNum(variantStock[variantKey(color, size)]);
};

/** Sum of all non-negative variant stock counts — the product's total stock. */
export const totalVariantStock = (variantStock: StockMap): number => {
  if (!variantStock) return 0;
  return Object.values(variantStock).reduce<number>((sum, n) => sum + toNum(n), 0);
};
