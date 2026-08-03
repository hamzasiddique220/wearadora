'use client';

import { useMemo } from 'react';
import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData, useVisibleProductsData } from '@/lib/stores/data';
import { getProductType } from '@/lib/constants';
import type { Product } from '@/types';

interface SlippersClientProps {
  initialProducts?: Product[];
}

export default function SlippersClient({
  initialProducts,
}: SlippersClientProps) {
  const { settings } = useSiteSettingsData();
  const { products } = useVisibleProductsData();

  const heroImages = useMemo(() => {
    const out: string[] = [];
    for (const p of products) {
      const type = p.productType || getProductType(p.category as string);
      if (type !== 'slippers') continue;
      for (const img of p.slideImages || []) {
        if (img) out.push(img);
      }
    }
    for (const s of settings.heroSlides) {
      if (s.kind === 'shoe' && s.image) out.push(s.image);
    }
    return out;
  }, [products, settings.heroSlides]);

  return (
    <CategoryPage
      productType="slippers"
      eyebrow="✦ 40+ Years of Craft"
      title="Ladies Shoes Online in Pakistan"
      heroImage={settings.slippersHero.image}
      heroImages={heroImages}
      heroKind={settings.slippersHero.kind}
      description="Handcrafted heels, slides, sandals and flats — four decades of cobbling experience, made in Karachi. Cash on delivery nationwide, free delivery over Rs. 4,500."
      initialProducts={initialProducts}
    />
  );
}
