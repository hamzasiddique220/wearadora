'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlistStore } from '@/lib/stores/wishlist';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const [selected, setSelected] = useState<Product | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-20 text-center">
        <div className="w-20 h-20 bg-sand flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-bronze" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl mb-3">Your wishlist is empty</h2>
        <p className="text-mocha mb-8 text-sm md:text-base">Save your favorite pieces here</p>
        <Link href="/shop" className="btn-primary inline-block">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
            ✦ Your Favorites
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2">Wishlist</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {items.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => setSelected(p)}
              delay={i * 0.03}
            />
          ))}
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
