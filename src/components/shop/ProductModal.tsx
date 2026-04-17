'use client';

import { X, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) =>
    product ? state.isWishlisted(product.id) : false
  );
  const showToast = useUIStore((state) => state.showToast);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    showToast('Added to bag');
    onClose();
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-5xl">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-square bg-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 md:p-12">
          <div className="text-[9px] tracking-[0.4em] uppercase text-bronze mb-3">
            ✦ {product.category}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-3">
            {product.name}
          </h2>
          <div className="text-2xl font-medium mb-6">{formatPrice(product.price)}</div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#8b6f47" color="#8b6f47" />
              ))}
            </div>
            <span className="text-xs text-mocha">Premium Quality</span>
          </div>

          <p className="text-sm text-mocha leading-relaxed mb-8">
            {product.description ||
              'A beautiful handcrafted piece from the WEARADORA collection.'}
          </p>

          <div className="space-y-4 mb-8 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <span className="text-mocha">Availability</span>
              <span
                className={product.stock > 0 ? 'text-[#2d6a4f]' : 'text-[#c94b4b]'}
              >
                {product.stock > 0
                  ? `✓ In Stock (${product.stock})`
                  : '✗ Out of Stock'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <span className="text-mocha">Category</span>
              <span>{product.category}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <span className="text-mocha">Delivery</span>
              <span>2-4 days nationwide</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Add to Bag
            </button>
            <button onClick={handleWishlist} className="btn-outline px-4">
              <Heart
                size={16}
                fill={isWishlisted ? '#8b6f47' : 'none'}
                color={isWishlisted ? '#8b6f47' : 'currentColor'}
              />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
