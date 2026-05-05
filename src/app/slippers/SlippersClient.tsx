'use client';

import { useMemo } from 'react';
import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData, useVisibleProductsData } from '@/lib/stores/data';
import { getProductType } from '@/lib/constants';

export default function SlippersClient() {
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
      title="Shoes Collection"
      heroImage={settings.slippersHero.image}
      heroImages={heroImages}
      heroKind={settings.slippersHero.kind}
      description="Slides, heels and sandals handcrafted in-house — four decades of cobbling experience bringing you comfort and design in a single pair."
    />
  );
}
