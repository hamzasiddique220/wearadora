'use client';

import { useProducts } from '@/hooks/useProducts';
import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StorySection from '@/components/home/StorySection';

export default function HomePage() {
  const { products, loading } = useProducts();

  return (
    <>
      <Hero />
      <StatsBar />
      <CategoriesGrid />

      <FeaturedProducts
        products={products}
        loading={loading}
        productType="jewelry"
        eyebrow="✦ Jewelry Collection"
        title="Handcrafted Jewelry"
        description="Timeless pieces crafted for those who appreciate refined elegance and heritage craftsmanship."
        viewAllHref="/jewelry"
        limit={8}
      />

      <FeaturedProducts
        products={products}
        loading={loading}
        productType="slippers"
        eyebrow="✦ Artisan Footwear"
        title="Khussas & Sandals"
        description="Traditional artistry meets modern comfort — step into grace with every stride."
        viewAllHref="/slippers"
        limit={8}
        theme="dark"
      />

      <StorySection />
    </>
  );
}
