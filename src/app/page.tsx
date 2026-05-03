'use client';

import { useVisibleProducts } from '@/hooks/useVisibleProducts';
import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StorySection from '@/components/home/StorySection';

export default function HomePage() {
  const { products, loading, jewelryEnabled } = useVisibleProducts();

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
