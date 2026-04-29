'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  Award,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType, COLOR_HEX, STORE_CONFIG } from '@/lib/constants';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';
import Loading from '@/components/ui/Loading';
import { heartBurst } from '@/lib/heartBurst';
import EmptyState from '@/components/ui/EmptyState';
import type { Product } from '@/types';

interface ProductPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const { products, loading } = useProducts();
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const showToast = useUIStore((state) => state.showToast);

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );
  const isWishlisted = useWishlistStore((state) =>
    product ? state.isWishlisted(product.id) : false
  );

  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <Loading message="Loading product..." />;

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <EmptyState message="We couldn't find this product. It may have been removed." />
        <Link href="/shop" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>
    );
  }

  const productType =
    product.productType || getProductType(product.category as string);
  const isSlippers = productType === 'slippers';
  const hasSizes = isSlippers && product.sizes && product.sizes.length > 0;
  const hasColors = isSlippers && product.colors && product.colors.length > 0;

  const galleryImages = (() => {
    const list = [
      ...(product.images || []),
      ...(product.image ? [product.image] : []),
    ];
    return Array.from(new Set(list.filter(Boolean)));
  })();

  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.productType || getProductType(p.category as string)) === productType
    )
    .slice(0, 4);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart(product, { selectedSize, selectedColor });
    }
    const variant = [selectedSize ? `Size ${selectedSize}` : null, selectedColor]
      .filter(Boolean)
      .join(' • ');
    showToast(
      variant ? `Added ${qty}× — ${variant}` : `Added ${qty}× to bag`
    );
  };

  const handleBuyNow = () => {
    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart(product, { selectedSize, selectedColor });
    }
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
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-mocha mb-6 flex-wrap">
          <Link href="/" className="hover:text-bronze">
            Home
          </Link>
          <ChevronRight size={12} className="text-stone" />
          <Link href={collectionHref} className="hover:text-bronze">
            {collectionLabel}
          </Link>
          <ChevronRight size={12} className="text-stone" />
          <span className="text-bronze">{product.category}</span>
          <ChevronRight size={12} className="text-stone" />
          <span className="text-charcoal truncate max-w-[180px] md:max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-14">
          <ProductGallery
            images={galleryImages}
            alt={product.name}
            activeUrl={
              selectedColor && product.colorImages
                ? product.colorImages[selectedColor]
                : undefined
            }
          />

          <div className="md:sticky md:top-28 md:self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:pr-1">
            <div className="text-[10px] tracking-[0.4em] uppercase text-bronze mb-3">
              ✦ {product.category}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-light leading-[1.1] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="#8b6f47" color="#8b6f47" />
                ))}
              </div>
              <span className="text-xs text-mocha">Premium Quality • Handcrafted</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6 flex-wrap">
              <span className="text-3xl md:text-4xl font-medium">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-mocha line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-[#c94b4b] text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm md:text-base text-mocha leading-relaxed mb-8 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {hasSizes && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                    Select Size
                  </label>
                  {selectedSize && (
                    <span className="text-xs text-charcoal">
                      Size {selectedSize}
                    </span>
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
                        {selected && <Check size={12} />}
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

            <div className="mb-6">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-3 block">
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
                    setQty((q) =>
                      product.stock ? Math.min(product.stock, q + 1) : q + 1
                    )
                  }
                  className="w-11 h-11 text-lg hover:bg-sand transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

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
                <span>{STORE_CONFIG.deliveryDays} nationwide</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <span className="text-mocha">Shipping</span>
                <span className="text-[#2d6a4f]">FREE on 2+ items</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <span className="text-mocha">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <span className="text-mocha">SKU</span>
                <button
                  type="button"
                  onClick={() => {
                    const value = product.sku?.trim() || product.id;
                    navigator.clipboard?.writeText(value);
                    showToast('SKU copied');
                  }}
                  className="font-mono text-xs flex items-center gap-1.5 hover:text-bronze"
                  title="Click to copy"
                >
                  {product.sku?.trim() || product.id.slice(0, 10).toUpperCase()}
                  <Copy size={12} />
                </button>
              </div>
              {product.tag && (
                <div className="flex items-center justify-between pb-3 border-b border-stone">
                  <span className="text-mocha">Tag</span>
                  <span className="text-xs tracking-[0.15em] uppercase text-bronze">
                    {product.tag}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
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
              disabled={product.stock === 0}
              className="btn-outline w-full mb-6"
            >
              Buy It Now
            </button>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={18} className="text-bronze" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                  {STORE_CONFIG.deliveryDays}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Shield size={18} className="text-bronze" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                  Handcrafted
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Award size={18} className="text-bronze" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">
                  40+ Yrs Craft
                </span>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
                  ✦ You may also like
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-light mt-2">
                  More from {collectionLabel}
                </h2>
              </div>
              <Link
                href={collectionHref}
                className="text-xs tracking-[0.2em] uppercase hover:text-bronze"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
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

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
