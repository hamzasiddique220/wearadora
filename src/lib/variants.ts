const SEP = '__';

/** Key format for `Product.variantStock` — one stock count per (color, size) pair. */
export const variantKey = (color: string, size: number): string => `${color}${SEP}${size}`;

/**
 * Sizes with a defined variant entry for this color, ascending. A size with a
 * key present (even at 0 stock) is "offered but sold out"; a size with no key
 * at all is not offered for this color.
 */
export const sizesForColor = (
  variantStock: Record<string, number> | undefined,
  color: string
): number[] => {
  if (!variantStock) return [];
  const prefix = `${color}${SEP}`;
  return Object.keys(variantStock)
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(k.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
};

export const stockForVariant = (
  variantStock: Record<string, number> | undefined,
  color?: string,
  size?: number
): number => {
  if (!variantStock || !color || size === undefined) return 0;
  return variantStock[variantKey(color, size)] ?? 0;
};

/** Sum of all non-negative variant stock counts — the product's total stock. */
export const totalVariantStock = (
  variantStock: Record<string, number> | undefined
): number => {
  if (!variantStock) return 0;
  return Object.values(variantStock).reduce(
    (sum, n) => sum + (typeof n === 'number' && n > 0 ? n : 0),
    0
  );
};
