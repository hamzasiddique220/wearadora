'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
}

export default function FeaturedProducts({ products, loading }: FeaturedProductsProps) {
  const [selected, setSelected] = useState<Product | null>(null);
  const featured = products.slice(0, 8);

  return (
    <>
      <section className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Bestsellers
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light mt-2 mb-4">
            Curated Favorites
          </h2>
          <p className="text-sm text-mocha max-w-xl mx-auto">
            Pieces loved most by our community, each one handpicked for its
            exceptional craftsmanship.
          </p>
        </div>

        {loading ? (
          <Loading message="Loading collection..." />
        ) : featured.length === 0 ? (
          <EmptyState message="No products yet. Admin needs to add products first." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => setSelected(p)}
                delay={i * 0.05}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/shop" className="btn-outline inline-block">
            View All Products
          </Link>
        </div>
      </section>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
