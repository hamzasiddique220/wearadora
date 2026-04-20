'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product, ProductType } from '@/types';
import { getProductType } from '@/lib/constants';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import Reveal from '@/components/ui/Reveal';

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  productType?: ProductType;
  eyebrow?: string;
  title?: string;
  description?: string;
  viewAllHref?: string;
  limit?: number;
  theme?: 'light' | 'dark';
}

export default function FeaturedProducts({
  products,
  loading,
  productType,
  eyebrow = '✦ Bestsellers',
  title = 'Curated Favorites',
  description = 'Pieces loved most by our community, each one handpicked for its exceptional craftsmanship.',
  viewAllHref = '/shop',
  limit = 8,
  theme = 'light',
}: FeaturedProductsProps) {
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const list = productType
      ? products.filter(
          (p) =>
            (p.productType || getProductType(p.category as string)) === productType
        )
      : products;
    return list.slice(0, limit);
  }, [products, productType, limit]);

  const isDark = theme === 'dark';

  return (
    <>
      <section
        className={`py-20 px-6 md:px-12 ${
          isDark ? 'bg-charcoal text-cream' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
                  {eyebrow}
                </span>
                <h2
                  className={`font-serif text-4xl md:text-5xl font-light mt-2 leading-tight ${
                    isDark ? '' : ''
                  }`}
                >
                  {title}
                </h2>
                <p
                  className={`text-sm mt-3 max-w-xl ${
                    isDark ? 'text-stone' : 'text-mocha'
                  }`}
                >
                  {description}
                </p>
              </div>
              <Link
                href={viewAllHref}
                className={`text-xs tracking-[0.2em] uppercase flex items-center gap-2 border-b pb-1 hover:gap-3 transition-all ${
                  isDark
                    ? 'border-stone/40 hover:border-bronze text-cream'
                    : 'border-charcoal hover:text-bronze hover:border-bronze'
                }`}
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <Loading message="Loading collection..." />
          ) : filtered.length === 0 ? (
            <EmptyState message="No products yet. Admin needs to add products first." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setSelected(p)}
                  delay={i * 0.05}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
