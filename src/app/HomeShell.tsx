'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDataStore } from '@/lib/stores/data';
import { useVisibleProductsData } from '@/lib/stores/data';
import Hero from '@/components/home/Hero';

// Below-fold sections are dynamic-imported so the initial JS payload only
// ships Hero on first load. They still render server-side (no `ssr: false`)
// so SEO content is preserved; only their client JS is split.
const StatsBar = dynamic(() => import('@/components/home/StatsBar'));
const CategoriesGrid = dynamic(() => import('@/components/home/CategoriesGrid'));
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'));
const StorySection = dynamic(() => import('@/components/home/StorySection'));

export default function HomeShell() {
  // Keep one realtime subscription alive while the homepage is mounted so the
  // catalog stays in sync with admin edits without each component opening its
  // own onSnapshot listener.
  useEffect(() => {
    useDataStore.getState().acquire();
    return () => {
      useDataStore.getState().release();
    };
  }, []);

  const { products, loading, jewelryEnabled } = useVisibleProductsData();

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
          limit={8}
          theme="dark"
        />
      )}

      <StorySection />
    </>
  );
}
