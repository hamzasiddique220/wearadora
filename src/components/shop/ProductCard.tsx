'use client';

import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType, COLOR_HEX } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  delay?: number;
}

export default function ProductCard({ product, onClick, delay = 0 }: ProductCardProps) {
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

  const handleAddToCart = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    const added = toggleWishlist(product);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div
      className="group relative animate-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        onClick={onClick}
        className="relative aspect-[3/4] bg-sand overflow-hidden cursor-pointer rounded-sm"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
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
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-9 h-9 bg-white/95 backdrop-blur flex items-center justify-center hover:bg-charcoal hover:text-cream transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="absolute bottom-0 left-0 right-0 bg-charcoal text-cream py-3.5 text-[10px] tracking-[0.3em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={12} />
          {hasVariants ? 'Select Options' : 'Add to Bag'}
        </button>
      </div>

      <div className="pt-4 pb-2 px-0.5">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="text-[9px] tracking-[0.3em] uppercase text-bronze">
            {product.category}
          </div>
          {product.stock > 0 && product.stock <= 3 && (
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#c94b4b]">
              Only {product.stock} left
            </div>
          )}
        </div>
        <h3
          onClick={onClick}
          className="font-serif text-lg leading-tight mb-2 cursor-pointer hover:text-bronze transition-colors line-clamp-2"
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="font-medium">{formatPrice(product.price)}</div>
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
