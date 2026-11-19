'use client';

import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductsData } from '@/lib/stores/data';
import { Product, ProductType } from '@/types';
import {
  getProductType,
  normalizeCategory,
  JEWELRY_CATEGORIES,
  SLIPPERS_CATEGORIES,
} from '@/lib/constants';
import { jewelryCategoryHref } from '@/lib/categories';
import { SHOES_BASE, slippersCategoryHref } from '@/lib/footwearCategories';
import ProductCard from '@/components/shop/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import CategoryHero, { type HeroCta } from '@/components/category/CategoryHero';

const ProductModal = dynamic(() => import('@/components/shop/ProductModal'), {
  ssr: false,
});

interface CategoryPageProps {
  productType: ProductType;
  eyebrow: string;
  title: string;
  heroImage: string;
  description: string;
  /** 'photo' = editorial crop, 'product' = cut-out PNG on cream */
  heroKind?: 'photo' | 'product';
  /** Optional list of additional images to cycle through as a slideshow. */
  heroImages?: string[];
  /** One real primary CTA in the hero. */
  cta?: HeroCta;
  /** Short, specific placeholder — never the SEO H1. */
  searchPlaceholder: string;
  /** Plural noun for the empty state, e.g. "jewellery", "shoes". */
  itemNoun: string;
  /**
   * Server-fetched products used to render the grid in the initial HTML.
   * Once the client-side store finishes loading its own copy, we switch to
   * the store so admin edits still stream in live.
   */
  initialProducts?: Product[];
}

function CategoryContent({
  productType,
  eyebrow,
  title,
  heroImage,
  description,
  heroKind = 'photo',
  heroImages,
  cta,
  searchPlaceholder,
  itemNoun,
  initialProducts,
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
    // Respect reduced-motion: no auto-advance, arrows/dots still work.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  const isProductShot = heroKind === 'product';

  const media = (
    <>
      {slideshow.map((src, i) => {
        // Render only the previous (fading out), visible and next (preloaded)
        // slides. The shoes slideshow can hold ~90 product images — rendering
        // all of them made the browser download every one.
        const n = slideshow.length;
        const near = [heroIndex, (heroIndex + 1) % n, (heroIndex - 1 + n) % n];
        if (!near.includes(i)) return null;
        return (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? title : ''}
          fill
          // Only the first (LCP) image is prioritised.
          priority={i === 0}
          fetchPriority={i === 0 ? 'high' : 'auto'}
          sizes="(min-width: 768px) 58vw, 100vw"
          className={`transition-opacity duration-[900ms] ease-in-out ${
            isProductShot
              ? 'object-contain p-5 md:p-8 drop-shadow-[0_24px_40px_rgba(26,22,20,0.28)]'
              : 'object-cover object-center'
          } ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
        />
        );
      })}
      {slideshow.length > 1 && (
        // Controls live INSIDE the image panel, next to the content — not at
        // the far edges of the viewport.
        <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-10 flex items-center gap-2">
          {slideshow.length <= 8 ? (
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              {slideshow.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === heroIndex}
                  className={`h-[3px] w-6 bg-charcoal transition-opacity ${
                    i === heroIndex ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                  }`}
                />
              ))}
            </div>
          ) : (
            // Many slides (e.g. every product's slide image): a counter
            // instead of a long row of dashes across the photo.
            <span className="mr-1 px-2.5 h-9 inline-flex items-center bg-cream/90 text-charcoal text-[11px] tracking-[0.15em] tabular-nums" aria-live="polite">
              {heroIndex + 1} / {slideshow.length}
            </span>
          )}
          <button
            onClick={() =>
              setHeroIndex((c) => (c - 1 + slideshow.length) % slideshow.length)
            }
            aria-label="Previous image"
            className="w-9 h-9 bg-cream/90 hover:bg-cream text-charcoal flex items-center justify-center shadow-sm transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setHeroIndex((c) => (c + 1) % slideshow.length)}
            aria-label="Next image"
            className="w-9 h-9 bg-cream/90 hover:bg-cream text-charcoal flex items-center justify-center shadow-sm transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );

  const basePath = productType === 'jewelry' ? '/jewelry' : SHOES_BASE;

  return (
    <>
      <CategoryHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        kind={heroKind}
        media={media}
        cta={cta}
      />

      <div id="products" className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 pt-4 md:pt-6 pb-10 md:pb-14 scroll-mt-24">
        {/* One toolbar: category chips + search, directly above the grid. */}
        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between md:gap-6 mb-5 md:mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 md:pb-0">
            {subCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              const className = `whitespace-nowrap px-4 py-2 text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase border transition-all ${
                isActive
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-transparent text-charcoal border-stone hover:border-charcoal'
              }`;
              // Sub-categories are real SEO pages — link to them instead of
              // filtering client-side.
              const categoryHref =
                productType === 'jewelry'
                  ? jewelryCategoryHref(cat)
                  : slippersCategoryHref(cat);
              return (
                <Link
                  key={cat}
                  href={cat === 'all' ? basePath : categoryHref}
                  className={className}
                >
                  {cat === 'all' ? 'All Items' : cat}
                </Link>
              );
            })}
          </div>

          <div className="relative w-full md:w-72 lg:w-80 shrink-0">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-bronze-ink pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder.replace(/…$/, '')}
              className="w-full h-10 pl-10 pr-9 bg-white border border-stone rounded-full text-[13px] text-charcoal placeholder:text-mocha/70 focus:outline-none focus:border-bronze focus:ring-4 focus:ring-bronze/10 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mocha hover:text-charcoal text-sm"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loading message="Loading products..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            message={`No ${itemNoun} found. Try a different search or category.`}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
            {filteredProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => setSelected(p)}
                delay={i * 0.03}
                // The hero image is the page's only `priority` image (LCP).
                // Cards use native lazy-loading; the browser still fetches
                // the ones already in/near the viewport immediately.
                priority={false}
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
