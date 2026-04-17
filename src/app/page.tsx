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
      <FeaturedProducts products={products} loading={loading} />
      <StorySection />
    </>
  );
}
