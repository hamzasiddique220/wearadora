'use client';

import dynamic from 'next/dynamic';
import { useVisibleProductsData } from '@/lib/stores/data';
import Hero from '@/components/home/Hero';
import type { Product } from '@/types';

// Below-fold sections are dynamic-imported so the initial JS payload only
// ships Hero on first load. They still render server-side (no `ssr: false`)
// so SEO content is preserved; only their client JS is split.
const StatsBar = dynamic(() => import('@/components/home/StatsBar'));
const CategoriesGrid = dynamic(() => import('@/components/home/CategoriesGrid'));
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'));
const StorySection = dynamic(() => import('@/components/home/StorySection'));

interface HomeShellProps {
  /**
   * Server-fetched products used to render the FeaturedProducts grid in the
   * initial HTML — kills the "Loading collection..." flash (better LCP + CLS).
   * Once the client-side store finishes loading, we switch to the store copy.
   */
  initialProducts?: Product[];
  /** Server-fetched flag — used until the client store hydrates. */
  initialJewelryEnabled?: boolean;
}

export default function HomeShell({
  initialProducts,
  initialJewelryEnabled = false,
}: HomeShellProps) {
  const {
    products: storeProducts,
    loading: storeLoading,
    jewelryEnabled: storeJewelryEnabled,
  } = useVisibleProductsData();
  const hasInitial = Boolean(initialProducts && initialProducts.length > 0);
  const products =
    storeLoading && hasInitial ? initialProducts! : storeProducts;
  const loading = storeLoading && !hasInitial;
  const jewelryEnabled = storeLoading
    ? initialJewelryEnabled
    : storeJewelryEnabled;

  return (
    <>
      <Hero />
      <StatsBar />
      <CategoriesGrid />

      <FeaturedProducts
        products={products}
        loading={loading}
        productType="slippers"
        eyebrow="✦ Signature Footwear"
        title="Slides & Heels"
        description="Handcrafted footwear with embellished detailing — where contemporary design meets lasting comfort."
        viewAllHref="/slippers"
        viewAllLabel="Shop Ladies Shoes"
        limit={8}
      />

      {jewelryEnabled && (
        <FeaturedProducts
          products={products}
          loading={loading}
          productType="jewelry"
          eyebrow="✦ Jewelry Collection"
          title="Handcrafted Jewelry"
          description="Timeless pieces crafted for those who appreciate refined elegance and heritage craftsmanship."
          viewAllHref="/jewelry"
          viewAllLabel="Shop Jewellery"
          limit={8}
          theme="dark"
        />
      )}

      <StorySection />
    </>
  );
}
