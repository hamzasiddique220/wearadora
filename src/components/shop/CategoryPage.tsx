'use client';

import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductsData } from '@/lib/stores/data';
import { Product, ProductType } from '@/types';
import {
  getProductType,
  normalizeCategory,
  JEWELRY_CATEGORIES,
  SLIPPERS_CATEGORIES,
} from '@/lib/constants';
import ProductCard from '@/components/shop/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

const ProductModal = dynamic(() => import('@/components/shop/ProductModal'), {
  ssr: false,
});

interface CategoryPageProps {
  productType: ProductType;
  eyebrow: string;
  title: string;
  heroImage: string;
  description: string;
  /** 'photo' = background-cover editorial image, 'product' = centered transparent PNG on cream */
  heroKind?: 'photo' | 'product';
  /** Optional list of additional images to cycle through as a slideshow. */
  heroImages?: string[];
  /**
   * Server-fetched products used to render the grid in the initial HTML.
   * Once the client-side store finishes loading its own copy, we switch to
   * the store so admin edits still stream in live.
   */
  initialProducts?: Product[];
  /**
   * Optional rich content rendered directly under the hero, above the
   * search/filter row — useful for keyword-focused intro paragraphs on
   * SEO landing pages.
   */
  belowHero?: React.ReactNode;
}

function CategoryContent({
  productType,
  eyebrow,
  title,
  heroImage,
  description,
  heroKind = 'photo',
  heroImages,
  initialProducts,
  belowHero,
}: CategoryPageProps) {
  const { products: storeProducts, loading: storeLoading } = useProductsData();
  const hasInitial = Boolean(initialProducts && initialProducts.length > 0);
  const products =
    storeLoading && hasInitial ? initialProducts! : storeProducts;
  // Skip the "Loading products..." spinner if we have SSR products — those
  // renders are what search engines and first-paint visitors see.
  const loading = storeLoading && !hasInitial;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [selected, setSelected] = useState<Product | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const slideshow = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (url?: string) => {
      if (!url) return;
      if (seen.has(url)) return;
      seen.add(url);
      out.push(url);
    };
    push(heroImage);
    if (heroImages) heroImages.forEach(push);
    return out;
  }, [heroImage, heroImages]);

  useEffect(() => {
    if (heroIndex >= slideshow.length) setHeroIndex(0);
  }, [slideshow.length, heroIndex]);

  useEffect(() => {
    if (slideshow.length <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((c) => (c + 1) % slideshow.length);
    }, 4500);
    return () => clearInterval(t);
  }, [slideshow.length]);

  const subCategories = useMemo(
    () =>
      productType === 'jewelry'
        ? ['all', ...JEWELRY_CATEGORIES]
        : ['all', ...SLIPPERS_CATEGORIES],
    [productType]
  );

  useEffect(() => {
    // Read `?category=` from the URL client-side. Avoids `useSearchParams`
    // (which forces the whole component behind a Suspense boundary and
    // makes the grid render only after hydration — bad for SEO).
    if (typeof window === 'undefined') return;
    const param = new URLSearchParams(window.location.search).get('category');
    if (!param) return;
    const normalized = normalizeCategory(param);
    if (subCategories.includes(normalized)) {
      setSelectedCategory(normalized);
    } else if (normalized.toLowerCase() === 'all') {
      setSelectedCategory('all');
    }
  }, [subCategories]);

  const filteredProducts = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return products.filter((p) => {
      const type = p.productType || getProductType(p.category as string);
      if (type !== productType) return false;
      const productCat = normalizeCategory(p.category as string);
      const matchCat =
        selectedCategory === 'all' || productCat === selectedCategory;
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, deferredQuery, productType]);

  return (
    <>
      {heroKind === 'product' ? (
        <section
          className="relative overflow-hidden grain"
          style={{
            background:
              'linear-gradient(135deg, #f5f1ea 0%, #e8ddc7 55%, #d4c9b8 100%)',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16 grid md:grid-cols-[1fr_1fr] gap-6 md:gap-8 items-center">
            <div>
              <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze mb-3 inline-block">
                {eyebrow}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-light leading-[1.05]">
                {title}
              </h1>
              <p className="text-mocha mt-3 md:mt-4 max-w-xl text-[13px] sm:text-sm md:text-base leading-relaxed">
                {description}
              </p>
              <div className="mt-4 md:mt-5 flex flex-wrap gap-2 text-[9px] sm:text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase">
                <span className="bg-charcoal text-cream px-2.5 md:px-3 py-1.5">
                  40+ Yrs Craft
                </span>
                <span className="border border-bronze text-bronze px-2.5 md:px-3 py-1.5">
                  Handmade
                </span>
                <span className="border border-charcoal/40 px-2.5 md:px-3 py-1.5">
                  Comfort + Design
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-60 float-3d"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(139,111,71,0.55) 0%, transparent 65%)',
                }}
              />
              <div className="relative w-full h-full max-h-[40vh] md:max-h-[55vh] float-3d scale-110">
                {slideshow.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt={title}
                    fill
                    priority={i === 0}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className={`object-contain drop-shadow-[0_30px_60px_rgba(26,22,20,0.35)] transition-opacity duration-[900ms] ease-in-out ${
                      i === heroIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          {slideshow.length > 1 && (
            <>
              <button
                onClick={() =>
                  setHeroIndex((c) => (c - 1 + slideshow.length) % slideshow.length)
                }
                aria-label="Previous slide"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/80 hover:bg-white backdrop-blur items-center justify-center shadow transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setHeroIndex((c) => (c + 1) % slideshow.length)}
                aria-label="Next slide"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/80 hover:bg-white backdrop-blur items-center justify-center shadow transition"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                {slideshow.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`transition-all h-[3px] ${
                      i === heroIndex
                        ? 'w-8 bg-charcoal'
                        : 'w-5 bg-charcoal/30 hover:bg-charcoal/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative h-[36vh] sm:h-[42vh] md:h-[50vh] overflow-hidden grain">
          {slideshow.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={title}
              fill
              priority={i === 0}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              sizes="100vw"
              className={`object-cover transition-opacity duration-[900ms] ease-in-out ${
                i === heroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/30 to-cream" />
          <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze mb-2 md:mb-3">
              {eyebrow}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-light text-white drop-shadow">
              {title}
            </h1>
            <p className="text-white/90 mt-3 md:mt-4 max-w-xl text-[13px] sm:text-sm md:text-base px-2">
              {description}
            </p>
          </div>
          {slideshow.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slideshow.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`transition-all h-[3px] ${
                    i === heroIndex
                      ? 'w-8 bg-cream'
                      : 'w-5 bg-cream/40 hover:bg-cream/70'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {belowHero}

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="mb-6 md:mb-8 max-w-md mx-auto relative">
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

        <div className="flex gap-2 mb-8 md:mb-10 overflow-x-auto scrollbar-hide pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 justify-start md:justify-center">
          {subCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 md:px-5 py-2 text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase border transition-all ${
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
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
  return <CategoryContent {...props} />;
}
