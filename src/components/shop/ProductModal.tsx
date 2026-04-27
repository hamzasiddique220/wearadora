'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType, COLOR_HEX } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import { heartBurst } from '@/lib/heartBurst';

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

  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setActiveImage(0);
  }, [product?.id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [
      ...(product.images || []),
      ...(product.image ? [product.image] : []),
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  if (!product) return null;

  const productType =
    product.productType || getProductType(product.category as string);
  const isSlippers = productType === 'slippers';
  const hasSizes = isSlippers && product.sizes && product.sizes.length > 0;
  const hasColors = isSlippers && product.colors && product.colors.length > 0;
  const currentImage = galleryImages[activeImage] || product.image;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }
    addToCart(product, {
      selectedSize,
      selectedColor,
    });
    const variantText = [
      selectedSize ? `Size ${selectedSize}` : null,
      selectedColor,
    ]
      .filter(Boolean)
      .join(' • ');
    showToast(variantText ? `Added — ${variantText}` : 'Added to bag');
    onClose();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    const added = toggleWishlist(product);
    if (added) heartBurst(e.clientX, e.clientY);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-4xl">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative bg-cream flex flex-col">
          <div className="relative aspect-square flex items-center justify-center [&_img]:[mix-blend-mode:darken]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain p-4 md:p-6"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 bg-white/95 flex items-center justify-center hover:bg-white shadow z-10"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            {product.isNew && (
              <div className="absolute top-3 left-3 bg-bronze text-white text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 z-10">
                New
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-white/40">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative shrink-0 w-14 h-14 overflow-hidden border transition-all bg-cream [&_img]:[mix-blend-mode:darken] ${
                    activeImage === i
                      ? 'border-bronze'
                      : 'border-stone/60 hover:border-stone'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 overflow-y-auto max-h-[90vh]">
          <div className="text-[9px] tracking-[0.4em] uppercase text-bronze mb-3">
            ✦ {product.category}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-3 leading-tight">
            {product.name}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#8b6f47" color="#8b6f47" />
              ))}
            </div>
            <span className="text-xs text-mocha">Premium Quality</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6 flex-wrap">
            <span className="text-3xl font-medium">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-mocha line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="bg-[#c94b4b] text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1">
                  Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-mocha leading-relaxed mb-6">
            {product.description ||
              'A beautiful handcrafted piece from the WEARADORA collection.'}
          </p>

          {hasSizes && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                  Select Size
                </label>
                {selectedSize && (
                  <span className="text-xs text-charcoal">Size {selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes!.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white border-stone hover:border-charcoal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasColors && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                  Select Color
                </label>
                {selectedColor && (
                  <span className="text-xs text-charcoal">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors!.map((color) => {
                  const selected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
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
            </div>
          )}

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <span className="text-mocha">Availability</span>
              <span
                className={
                  product.stock > 0 ? 'text-[#2d6a4f] font-medium' : 'text-[#c94b4b]'
                }
              >
                {product.stock > 0
                  ? `✓ In Stock (${product.stock})`
                  : '✗ Out of Stock'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <span className="text-mocha">Delivery</span>
              <span>2-4 days nationwide</span>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Add to Bag
            </button>
            <button
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

          <Link
            href={`/product/${product.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 text-[11px] tracking-[0.25em] uppercase text-bronze hover:text-charcoal border-b border-bronze/40 hover:border-charcoal pb-1 mb-6 w-fit mx-auto transition"
          >
            View Full Details <ArrowRight size={12} />
          </Link>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Truck size={18} className="text-bronze" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                Fast Delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Shield size={18} className="text-bronze" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                Authentic
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw size={18} className="text-bronze" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                Easy Returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
