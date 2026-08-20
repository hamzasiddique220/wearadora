'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Award,
  Copy,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType, COLOR_HEX, STORE_CONFIG } from '@/lib/constants';
import { sizesForColor, stockForVariant, totalVariantStock } from '@/lib/variants';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/shop/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
import StarRating from '@/components/ui/StarRating';
import { useProductReviews } from '@/hooks/useReviews';
import { heartBurst } from '@/lib/heartBurst';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import type { Product } from '@/types';

const ProductModal = dynamic(() => import('@/components/shop/ProductModal'), {
  ssr: false,
});

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const showToast = useUIStore((state) => state.showToast);
  const isWishlisted = useWishlistStore((state) =>
    state.isWishlisted(product.id)
  );

  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { reviews: productReviews, loading: reviewsLoading } = useProductReviews(
    product.id
  );
  const reviewSummary = useMemo(() => {
    const approved = productReviews.filter((r) => r.status === 'approved');
    const count = approved.length;
    const average = count
      ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    return { average, count };
  }, [productReviews]);

  useEffect(() => {
    // Default to a color right away (either the one carried over from a
    // product card via ?color=, or just the first one) so sizes are visible
    // without an extra click. Read straight from the URL instead of
    // useSearchParams() so this stays a plain client-only effect and the
    // page keeps its static/ISR rendering (useSearchParams forces a Suspense
    // boundary to avoid de-opting the whole route to dynamic rendering).
    const colorParam =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('color')
        : null;
    const availableColors = product.colors || [];
    const initialColor =
      (colorParam && availableColors.includes(colorParam) ? colorParam : undefined) ??
      availableColors[0];

    setSelectedSize(undefined);
    setSelectedColor(initialColor);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackViewContent(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const productType =
    product.productType || getProductType(product.category as string);
  const isSlippers = productType === 'slippers';
  const hasColors = isSlippers && !!product.colors && product.colors.length > 0;

  // Once a product has colors, size availability comes entirely from
  // per-variant stock (color must be picked first); otherwise fall back to
  // the legacy flat size list.
  const availableSizes = useMemo(() => {
    if (!isSlippers) return [];
    if (hasColors) {
      return selectedColor ? sizesForColor(product.variantStock, selectedColor) : [];
    }
    return product.sizes || [];
  }, [isSlippers, hasColors, selectedColor, product.variantStock, product.sizes]);

  const hasSizes = hasColors ? !!selectedColor : availableSizes.length > 0;

  // Stock ceiling for the qty stepper / Add to Bag: once a specific
  // color+size is chosen, use that exact variant's count; otherwise fall
  // back to the product-wide total (sum of all variants for colored
  // products, since a stale flat `stock` number can't be trusted once
  // variants are in play).
  const maxQty = hasColors
    ? selectedColor && selectedSize
      ? stockForVariant(product.variantStock, selectedColor, selectedSize)
      : totalVariantStock(product.variantStock)
    : product.stock;

  // Picking a color/size can shrink the stock ceiling below whatever qty was
  // already dialed in — clamp it back down so Add to Bag can't exceed it.
  useEffect(() => {
    setQty((q) => (maxQty > 0 ? Math.min(q, maxQty) : q));
  }, [maxQty]);

  // Memoized so the reference is stable across renders (otherwise the gallery
  // keeps resetting to the first image). Color images are included so selecting
  // a color always finds a matching slide, even if that image wasn't already in
  // product.images.
  const galleryImages = useMemo(() => {
    const list = [
      ...(product.images || []),
      ...(product.image ? [product.image] : []),
      ...(product.colorImages ? Object.values(product.colorImages) : []),
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product.images, product.image, product.colorImages]);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const validateVariantSelection = (): boolean => {
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return false;
    }
    if (hasColors && selectedColor && availableSizes.length === 0) {
      showToast('This color has no sizes available right now', 'error');
      return false;
    }
    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return false;
    }
    if (hasColors && selectedColor && selectedSize && maxQty === 0) {
      showToast('That size is out of stock', 'error');
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateVariantSelection()) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product, { selectedSize, selectedColor });
    }
    trackAddToCart(product, qty, { size: selectedSize, color: selectedColor });
    const variant = [selectedSize ? `Size ${selectedSize}` : null, selectedColor]
      .filter(Boolean)
      .join(' • ');
    showToast(
      variant ? `Added ${qty}× — ${variant}` : `Added ${qty}× to bag`
    );
  };

  const handleBuyNow = () => {
    if (!validateVariantSelection()) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product, { selectedSize, selectedColor });
    }
    trackAddToCart(product, qty, { size: selectedSize, color: selectedColor });
    router.push('/cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    const added = toggleWishlist(product);
    if (added) heartBurst(e.clientX, e.clientY);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const collectionHref = isSlippers ? '/slippers' : '/jewelry';
  const collectionLabel = isSlippers ? 'Shoes' : 'Jewelry';

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 md:px-10 py-4 md:py-6 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-6 overflow-x-hidden">
        <nav className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase text-mocha mb-4 md:mb-6 flex-wrap">
          <Link href="/" className="hover:text-bronze">
            Home
          </Link>
          <ChevronRight size={11} className="text-stone" />
          <Link href={collectionHref} className="hover:text-bronze">
            {collectionLabel}
          </Link>
          <ChevronRight size={11} className="text-stone" />
          <span className="text-bronze">{product.category}</span>
          <ChevronRight size={11} className="text-stone hidden sm:inline" />
          <span className="text-charcoal truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs hidden sm:inline">
            {product.name}
          </span>
        </nav>

        <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 md:gap-14">
          <div className="min-w-0">
            <ProductGallery
              images={galleryImages}
              alt={`${product.name} — handcrafted ${product.category} by Wear Adora`}
              activeUrl={
                selectedColor && product.colorImages
                  ? product.colorImages[selectedColor]
                  : undefined
              }
            />
          </div>

          <div className="min-w-0 md:sticky md:top-28 md:self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:pr-1">
            <div className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze mb-2 md:mb-3">
              ✦ {product.category}
            </div>
            <h1 className="font-serif text-[26px] sm:text-3xl md:text-5xl font-light leading-[1.1] mb-3 md:mb-4 break-words">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5 flex-wrap">
              <StarRating value={Math.round(reviewSummary.average)} size={13} />
              {reviewSummary.count > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById('reviews')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="text-[11px] md:text-xs text-mocha hover:text-bronze hover:underline underline-offset-2"
                >
                  {reviewSummary.average.toFixed(1)} ({reviewSummary.count} review
                  {reviewSummary.count === 1 ? '' : 's'})
                </button>
              ) : (
                <span className="text-[11px] md:text-xs text-mocha">Premium Quality • Handcrafted</span>
              )}
            </div>

            <div className="flex items-baseline gap-2 md:gap-3 mb-5 md:mb-6 flex-wrap">
              <span className="text-2xl sm:text-3xl md:text-4xl font-medium">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base md:text-lg text-mocha line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-[#c94b4b] text-white text-[10px] tracking-[0.18em] uppercase px-2 py-1">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {hasColors && (
              <div className="mb-5 md:mb-6">
                <div className="flex items-center justify-between mb-2.5 md:mb-3">
                  <label className="text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase text-mocha">
                    Select Color
                  </label>
                  {selectedColor && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-charcoal font-medium">
                      <span
                        className="w-3 h-3 rounded-full border border-stone"
                        style={{
                          backgroundColor: COLOR_HEX[selectedColor] || '#ccc',
                        }}
                      />
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors!.map((color) => {
                    const selected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedSize(undefined);
                        }}
                        className={`flex items-center gap-2 px-2.5 md:px-3 py-2 border text-xs transition-all ${
                          selected
                            ? 'bg-charcoal text-cream border-charcoal'
                            : 'bg-white border-stone hover:border-charcoal'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone"
                          style={{ backgroundColor: COLOR_HEX[color] || '#ccc' }}
                        />
                        {color}
                      </button>
                    );
                  })}
                </div>
                {selectedColor && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-sand/60 border border-stone px-3 py-1.5 text-xs">
                    <span className="text-mocha">Selected:</span>
                    <span
                      className="w-4 h-4 rounded-full border border-stone"
                      style={{
                        backgroundColor: COLOR_HEX[selectedColor] || '#ccc',
                      }}
                    />
                    <span className="font-medium text-charcoal">
                      {selectedColor}
                    </span>
                  </div>
                )}
              </div>
            )}

            {isSlippers && (hasColors ? !!selectedColor : availableSizes.length > 0) && (
              <div className="mb-5 md:mb-6">
                <div className="flex items-center justify-between mb-2.5 md:mb-3">
                  <label className="text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase text-mocha">
                    Select Size
                  </label>
                  {selectedSize && (
                    <span className="text-xs text-charcoal">
                      Size {selectedSize}
                    </span>
                  )}
                </div>
                {availableSizes.length === 0 ? (
                  <p className="text-xs text-mocha italic">
                    No sizes available for {selectedColor} right now.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const variantOutOfStock =
                        hasColors &&
                        selectedColor !== undefined &&
                        stockForVariant(product.variantStock, selectedColor, size) === 0;
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={variantOutOfStock}
                          onClick={() => !variantOutOfStock && setSelectedSize(size)}
                          className={`w-11 h-11 md:w-12 md:h-12 border text-sm font-medium transition-all ${
                            variantOutOfStock
                              ? 'opacity-35 cursor-not-allowed line-through bg-sand/40 border-stone'
                              : selectedSize === size
                                ? 'bg-charcoal text-cream border-charcoal'
                                : 'bg-white border-stone hover:border-charcoal'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mb-5 md:mb-6">
              <label className="text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase text-mocha mb-2.5 md:mb-3 block">
                Quantity
              </label>
              <div className="inline-flex items-center border border-stone bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 text-lg hover:bg-sand transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))
                  }
                  className="w-11 h-11 text-lg hover:bg-sand transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick stock line — reassurance right before the CTA */}
            <div className="flex items-center gap-2 mb-4 text-[13px]">
              <span
                className={`${
                  maxQty > 0 ? 'text-[#2d6a4f] font-medium' : 'text-[#c94b4b]'
                }`}
              >
                {maxQty > 0
                  ? `✓ In Stock (${maxQty})`
                  : '✗ Out of Stock'}
              </span>
              <span className="text-mocha/60">·</span>
              <span className="text-mocha">
                Delivery in {STORE_CONFIG.deliveryDays}
              </span>
            </div>

            {/* CTA — Add to Bag + Wishlist + Buy It Now moved above the fold so
                first-time visitors see the buy actions immediately on desktop. */}
            <div className="hidden md:flex gap-3 mb-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={maxQty === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Add to Bag
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                className="btn-outline px-4"
                aria-label="Wishlist"
              >
                <Heart
                  size={16}
                  fill={isWishlisted ? '#8b6f47' : 'none'}
                  color={isWishlisted ? '#8b6f47' : 'currentColor'}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={maxQty === 0}
              className="btn-outline w-full mb-6 hidden md:block"
            >
              Buy It Now
            </button>

            {/* Full product description — placed below the CTA so first-time
                visitors see title, price, quantity and buy actions above the
                fold on desktop even when the description is long. */}
            {product.description && (
              <div className="mb-5 md:mb-6 pt-4 md:pt-6 border-t border-stone">
                <p className="text-[10px] tracking-[0.25em] uppercase text-bronze mb-3">
                  ✦ Description
                </p>
                <p className="text-[13px] sm:text-sm md:text-base text-mocha leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product info table (Delivery, Shipping, Returns, Category, SKU,
                Tag) — kept for reference below the CTA. */}
            <div className="space-y-2.5 md:space-y-3 mb-5 md:mb-6 text-[13px] md:text-sm">
              <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                <span className="text-mocha shrink-0">Delivery</span>
                <span className="text-right">{STORE_CONFIG.deliveryDays} nationwide</span>
              </div>
              <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                <span className="text-mocha shrink-0">Shipping</span>
                <span className="text-[#2d6a4f] text-right">FREE on orders Rs 4,500+</span>
              </div>
              <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                <span className="text-mocha shrink-0">Returns</span>
                <span className="text-right">7-day exchange &amp; refund</span>
              </div>
              <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                <span className="text-mocha shrink-0">Category</span>
                <span className="text-right truncate">{product.category}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                <span className="text-mocha shrink-0">SKU</span>
                <button
                  type="button"
                  onClick={() => {
                    const value = product.sku?.trim() || product.id;
                    navigator.clipboard?.writeText(value);
                    showToast('SKU copied');
                  }}
                  className="font-mono text-[11px] md:text-xs flex items-center gap-1.5 hover:text-bronze min-w-0"
                  title="Click to copy"
                >
                  <span className="truncate">
                    {product.sku?.trim() || product.id.slice(0, 10).toUpperCase()}
                  </span>
                  <Copy size={12} className="shrink-0" />
                </button>
              </div>
              {product.tag && (
                <div className="flex items-center justify-between gap-3 pb-2.5 md:pb-3 border-b border-stone">
                  <span className="text-mocha shrink-0">Tag</span>
                  <span className="text-[11px] md:text-xs tracking-[0.15em] uppercase text-bronze text-right truncate">
                    {product.tag}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-stone text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={18} className="text-bronze" />
                <span className="text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase text-mocha leading-tight">
                  {STORE_CONFIG.deliveryDays}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw size={18} className="text-bronze" />
                <span className="text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase text-mocha leading-tight">
                  7-Day Returns
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Award size={18} className="text-bronze" />
                <span className="text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase text-mocha leading-tight">
                  40+ Yrs Craft
                </span>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews
          productId={product.id}
          productName={product.name}
          reviews={productReviews}
          loading={reviewsLoading}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <div className="flex items-end justify-between mb-6 md:mb-8 flex-wrap gap-3 md:gap-4">
              <div>
                <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
                  ✦ You may also like
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mt-2">
                  More from {collectionLabel}
                </h2>
              </div>
              <Link
                href={collectionHref}
                className="text-[11px] md:text-xs tracking-[0.2em] uppercase hover:text-bronze"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setQuickViewProduct(p)}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-bag bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/98 backdrop-blur border-t border-stone px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] flex items-center gap-2 shadow-[0_-6px_20px_rgba(26,22,20,0.08)]">
        <button
          type="button"
          onClick={handleWishlist}
          className="w-11 h-11 shrink-0 border border-charcoal flex items-center justify-center"
          aria-label="Wishlist"
        >
          <Heart
            size={16}
            fill={isWishlisted ? '#8b6f47' : 'none'}
            color={isWishlisted ? '#8b6f47' : 'currentColor'}
          />
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={maxQty === 0}
          className="btn-outline flex-1 !py-3 !px-2 !text-[10px] disabled:opacity-50"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={maxQty === 0}
          className="btn-primary flex-1 !py-3 !px-2 !text-[10px] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <ShoppingBag size={13} /> Add to Bag
        </button>
      </div>

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
