'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, ImageOff } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice, productHandle } from '@/lib/utils';
import { getProductType, COLOR_HEX } from '@/lib/constants';
import { jewelryCategoryHref } from '@/lib/categories';
import { slippersCategoryHref } from '@/lib/footwearCategories';
import { allVariantSizes } from '@/lib/variants';
import { heartBurst } from '@/lib/heartBurst';
import { trackAddToCart } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  delay?: number;
  /** Card sits on a dark (e.g. charcoal) background — swaps text colors that would otherwise fail contrast. */
  theme?: 'light' | 'dark';
  /** Set on the first visible row of a grid so its image loads eagerly instead of lazily — avoids delaying LCP when this card, not the page hero, is the largest above-the-fold element. */
  priority?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  delay = 0,
  theme = 'light',
  priority = false,
}: ProductCardProps) {
  const isDark = theme === 'dark';
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const showToast = useUIStore((state) => state.showToast);
  const [primaryError, setPrimaryError] = useState(false);
  const [hoverError, setHoverError] = useState(false);
  const [cardColor, setCardColor] = useState<string | undefined>(undefined);

  const productType =
    product.productType || getProductType(product.category as string);
  const isSlippers = productType === 'slippers';
  const hasVariants =
    isSlippers &&
    ((product.sizes && product.sizes.length > 0) ||
      (product.colors && product.colors.length > 0));
  const outOfStock = product.stock === 0;

  const colorPreviewImage = cardColor ? product.colorImages?.[cardColor] : undefined;
  const primaryImage =
    colorPreviewImage || (product.images && product.images[0]) || product.image || '';
  const hoverImage =
    !colorPreviewImage && product.images && product.images.length > 1
      ? product.images[1]
      : null;
  const showPlaceholder = primaryError || !primaryImage;

  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;
  const hasLowStock = product.stock > 0 && product.stock <= 3;
  const hasColors = isSlippers && !!product.colors && product.colors.length > 0;
  // Per-color variant stock replaced the flat `sizes` list once a product
  // has colors — fall back to the flat list only when it doesn't.
  const cardSizes = hasColors ? allVariantSizes(product.variantStock) : product.sizes || [];

  // Carry a color chosen right on the card into the product page, so sizes
  // are visible immediately there without an extra click.
  const detailHref = cardColor
    ? `/product/${productHandle(product)}?color=${encodeURIComponent(cardColor)}`
    : `/product/${productHandle(product)}`;
  const categoryHref = isSlippers
    ? slippersCategoryHref(product.category as string)
    : jewelryCategoryHref(product.category as string);

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCardColor((c) => (c === color ? undefined : color));
    setPrimaryError(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) {
      router.push(detailHref);
      return;
    }
    addToCart(product);
    trackAddToCart(product, 1);
    showToast('Added to bag');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) heartBurst(e.clientX, e.clientY);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      className="group relative animate-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <Link
        href={detailHref}
        className="product-card-frame relative block aspect-square overflow-hidden rounded-md transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_40px_-18px_rgba(26,22,20,0.22)]"
      >
        {showPlaceholder ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-mocha/60 bg-sand/40">
            <ImageOff size={28} strokeWidth={1.2} />
            <span className="text-[9px] tracking-[0.25em] uppercase">Image unavalb</span>
          </div>
        ) : (
          <>
            <Image
              src={primaryImage}
              alt={`${product.name} — handcrafted ${product.category} by Wear Adora Pakistan`}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              {...(priority ? { priority: true } : { loading: 'lazy' as const })}
              onError={() => setPrimaryError(true)}
              className={`z-10 object-contain object-center [mix-blend-mode:darken] transition-transform duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04] ${
                hoverImage && !hoverError ? 'group-hover:opacity-0 transition-opacity' : ''
              }`}
            />
            {hoverImage && !hoverError && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                loading="lazy"
                onError={() => setHoverError(true)}
                className="z-10 object-contain object-center [mix-blend-mode:darken] opacity-0 group-hover:opacity-100 transition-opacity duration-[700ms]"
              />
            )}
          </>
        )}

        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
          {outOfStock && (
            <span className="bg-charcoal text-cream text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
              Sold Out
            </span>
          )}
          {product.isNew && !outOfStock && (
            <span className="bg-bronze text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
              New
            </span>
          )}
          {hasDiscount && !outOfStock && (
            <span className="bg-[#c94b4b] text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
              -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWishlist}
            className="w-9 h-9 bg-white/95 backdrop-blur flex items-center justify-center hover:bg-bronze hover:text-white transition-colors shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart
              size={15}
              fill={isWishlisted ? '#8b6f47' : 'none'}
              color={isWishlisted ? '#8b6f47' : 'currentColor'}
            />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="w-9 h-9 bg-white/95 backdrop-blur flex items-center justify-center hover:bg-charcoal hover:text-cream transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="bg-charcoal/95 backdrop-blur text-cream px-4 py-1.5 text-[9px] tracking-[0.2em] uppercase rounded-full disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-md hover:bg-charcoal whitespace-nowrap"
          >
            <ShoppingBag size={10} />
            {hasVariants ? 'Options' : 'Add to Bag'}
          </button>
        </div>
      </Link>

      <div className="pt-3 md:pt-4 pb-2 px-0.5">
        <div className="flex items-start justify-between gap-2 md:gap-3 mb-1.5">
          <div className="flex items-baseline gap-2 flex-wrap min-w-0">
            <Link
              href={categoryHref}
              onClick={(e) => e.stopPropagation()}
              className={`text-[9px] tracking-[0.25em] md:tracking-[0.3em] uppercase truncate hover:text-bronze transition-colors ${
                isDark ? 'text-stone' : 'text-mocha'
              }`}
            >
              {product.category}
            </Link>
            {product.sku && (
              <code className="text-[9px] font-mono text-mocha/70 hidden sm:inline">
                {product.sku}
              </code>
            )}
          </div>
          {hasLowStock && (
            <div className="text-[9px] tracking-[0.18em] md:tracking-[0.2em] uppercase text-[#c94b4b] shrink-0">
              Only {product.stock} left
            </div>
          )}
        </div>
        <Link
          href={detailHref}
          className="block font-serif text-base md:text-lg leading-tight mb-1.5 md:mb-2 hover:text-bronze transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
            <span className="font-medium text-sm md:text-base">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-[11px] md:text-xs text-mocha line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          {hasColors && (
            <div className="flex gap-1.5">
              {product.colors!.slice(0, 5).map((c) => {
                const selected = cardColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    aria-label={`Preview ${c}`}
                    onClick={(e) => handleColorSelect(e, c)}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      selected
                        ? 'border-charcoal ring-1 ring-offset-1 ring-charcoal scale-110'
                        : 'border-stone hover:scale-110'
                    }`}
                    style={{ backgroundColor: COLOR_HEX[c] || '#ccc' }}
                  />
                );
              })}
              {product.colors!.length > 5 && (
                <span className="text-[9px] text-mocha self-center">
                  +{product.colors!.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
        {cardSizes.length > 0 && (
          <div className="text-[9px] tracking-[0.2em] uppercase text-mocha mt-1.5">
            Sizes: {cardSizes.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
