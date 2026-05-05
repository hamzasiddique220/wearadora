'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/lib/stores/data';
import { useVisibleProductsData } from '@/lib/stores/data';
import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StorySection from '@/components/home/StorySection';

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
