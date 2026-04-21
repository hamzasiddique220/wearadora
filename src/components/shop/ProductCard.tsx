'use client';

import Link from 'next/link';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType, COLOR_HEX } from '@/lib/constants';
import Tilt3D from '@/components/ui/Tilt3D';
import { heartBurst } from '@/lib/heartBurst';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  delay?: number;
  theme?: 'light' | 'dark';
}

export default function ProductCard({ product, onClick, delay = 0, theme = 'light' }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const showToast = useUIStore((state) => state.showToast);

  const productType =
    product.productType || getProductType(product.category as string);
  const isSlippers = productType === 'slippers';
  const hasVariants =
    isSlippers &&
    ((product.sizes && product.sizes.length > 0) ||
      (product.colors && product.colors.length > 0));
  const outOfStock = product.stock === 0;

  const primaryImage =
    (product.images && product.images[0]) ||
    product.image ||
    'https://via.placeholder.com/400x400?text=No+Image';
  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const isTransparentProductShot =
    primaryImage.startsWith('/images/') ||
    /wearadora\.com\/wp-content/.test(primaryImage);

  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;
  const hasLowStock = product.stock > 0 && product.stock <= 3;

  const detailHref = `/product/${product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) {
      onClick();
      return;
    }
    addToCart(product);
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
      <Tilt3D max={10} scale={1.03} className="relative block rounded-sm">
      <Link
        href={detailHref}
        className={`relative block aspect-square overflow-hidden rounded-sm transition-shadow duration-500 ${
          theme === 'dark'
            ? 'product-surface-dark group-hover:shadow-2xl group-hover:shadow-black/50'
            : 'product-surface-light group-hover:shadow-xl group-hover:shadow-bronze/25'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full z-10 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06] ${
            theme === 'dark'
              ? 'object-contain'
              : isTransparentProductShot
                ? 'object-contain p-4 scale-105 soft-spin drop-shadow-[0_18px_24px_rgba(26,22,20,0.3)]'
                : 'object-cover'
          } ${hoverImage ? 'group-hover:opacity-0' : ''}`}
        />
        {hoverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[800ms] ${
              theme === 'dark'
                ? 'object-contain'
                : isTransparentProductShot
                  ? 'object-contain p-4 scale-105 drop-shadow-[0_18px_24px_rgba(26,22,20,0.3)]'
                  : 'object-cover'
            }`}
          />
        )}

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 shine-overlay" />

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

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="absolute bottom-0 left-0 right-0 z-30 bg-charcoal text-cream py-3.5 text-[10px] tracking-[0.3em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={12} />
          {hasVariants ? 'Select Options' : 'Add to Bag'}
        </button>
      </Link>
      </Tilt3D>

      <div className="pt-4 pb-2 px-0.5">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-[9px] tracking-[0.3em] uppercase text-bronze">
              {product.category}
            </div>
            {product.sku && (
              <code className="text-[9px] font-mono text-mocha/70">
                {product.sku}
              </code>
            )}
          </div>
          {hasLowStock && (
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#c94b4b]">
              Only {product.stock} left
            </div>
          )}
        </div>
        <Link
          href={detailHref}
          className="block font-serif text-lg leading-tight mb-2 hover:text-bronze transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-mocha line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          {isSlippers && product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  title={c}
                  className="w-3 h-3 rounded-full border border-stone"
                  style={{ backgroundColor: COLOR_HEX[c] || '#ccc' }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-mocha">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        {isSlippers && product.sizes && product.sizes.length > 0 && (
          <div className="text-[9px] tracking-[0.2em] uppercase text-mocha mt-1.5">
            Sizes: {product.sizes.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
