'use client';

import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
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
      className="product-card group relative hover-lift animate-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        onClick={onClick}
        className="relative aspect-[3/4] bg-sand overflow-hidden cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-charcoal text-cream text-[9px] tracking-[0.2em] uppercase px-2 py-1">
            Sold Out
          </div>
        )}

        {product.isNew && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-bronze text-white text-[9px] tracking-[0.2em] uppercase px-2 py-1">
            New
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-bronze hover:text-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            fill={isWishlisted ? '#8b6f47' : 'none'}
            color={isWishlisted ? '#8b6f47' : 'currentColor'}
          />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-charcoal text-cream py-3 text-[10px] tracking-[0.3em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50"
        >
          + Add to Bag
        </button>
      </div>

      <div className="pt-4 pb-2">
        <div className="text-[9px] tracking-[0.3em] uppercase text-bronze mb-1">
          {product.category}
        </div>
        <h3
          onClick={onClick}
          className="font-serif text-lg leading-tight mb-1 cursor-pointer hover:text-bronze"
        >
          {product.name}
        </h3>
        <div className="font-medium text-sm">{formatPrice(product.price)}</div>
      </div>
    </div>
  );
}
