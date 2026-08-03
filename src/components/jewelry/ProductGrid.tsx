'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Product } from '@/types';

const ProductModal = dynamic(() => import('@/components/shop/ProductModal'), {
  ssr: false,
});

interface ProductGridProps {
  /** Already-paginated slice of products to render on this page. */
  products: Product[];
  currentPage: number;
  totalPages: number;
  /** Category URL, e.g. '/jewelry/necklace' — pagination links append `?page=`. */
  basePath: string;
  emptyMessage: string;
}

export default function ProductGrid({
  products,
  currentPage,
  totalPages,
  basePath,
  emptyMessage,
}: ProductGridProps) {
  const [selected, setSelected] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 py-8 md:py-12">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  const pageHref = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 py-8 md:py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => setSelected(p)}
            delay={i * 0.03}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-10 md:mt-14 flex items-center justify-center gap-2"
        >
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center border transition-colors ${
              currentPage === 1
                ? 'border-stone text-mocha/40 pointer-events-none'
                : 'border-stone hover:border-charcoal'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${
                p === currentPage
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'border-stone hover:border-charcoal'
              }`}
            >
              {p}
            </Link>
          ))}
          <Link
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center border transition-colors ${
              currentPage === totalPages
                ? 'border-stone text-mocha/40 pointer-events-none'
                : 'border-stone hover:border-charcoal'
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </Link>
        </nav>
      )}

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
