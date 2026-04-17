'use client';

import { useState, useMemo, Suspense } from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product, ProductType } from '@/types';
import {
  getProductType,
  JEWELRY_CATEGORIES,
  SLIPPERS_CATEGORIES,
} from '@/lib/constants';
import ProductCard from '@/components/shop/ProductCard';
import ProductModal from '@/components/shop/ProductModal';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

interface CategoryPageProps {
  productType: ProductType;
  eyebrow: string;
  title: string;
  heroImage: string;
  description: string;
}

function CategoryContent({
  productType,
  eyebrow,
  title,
  heroImage,
  description,
}: CategoryPageProps) {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  const subCategories = useMemo(
    () =>
      productType === 'jewelry'
        ? ['all', ...JEWELRY_CATEGORIES]
        : ['all', ...SLIPPERS_CATEGORIES],
    [productType]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const type = p.productType || getProductType(p.category as string);
      if (type !== productType) return false;
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery, productType]);

  return (
    <>
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden grain">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/30 to-cream" />
        <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze mb-3">
            {eyebrow}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white drop-shadow">
            {title}
          </h1>
          <p className="text-white/90 mt-4 max-w-xl text-sm md:text-base">
            {description}
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        <div className="mb-8 max-w-md mx-auto relative">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-bronze pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
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
          {subCategories.map((cat) => (
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
          <EmptyState
            message={`No ${title.toLowerCase()} found. Try a different search or category.`}
          />
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

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
