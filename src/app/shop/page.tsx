'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

function ShopContent() {
  const { products, loading } = useProducts();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Collection
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light mt-2">
            The Boutique
          </h1>
        </div>

        <div className="mb-8 max-w-md mx-auto relative">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-bronze pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="search-field"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-mocha hover:text-charcoal"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2 justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-transparent text-charcoal border-stone hover:border-charcoal'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading message="Loading products..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState message="No products found. Try a different search or category." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => setSelected(p)}
                delay={i * 0.03}
              />
            ))}
          </div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShopContent />
    </Suspense>
  );
}
