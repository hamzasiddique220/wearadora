'use client';

import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData } from '@/lib/stores/data';

export default function SlippersClient() {
  const { settings } = useSiteSettingsData();
  return (
    <CategoryPage
      productType="slippers"
      eyebrow="✦ 40+ Years of Craft"
      title="Shoes Collection"
      heroImage={settings.slippersHero.image}
      heroKind={settings.slippersHero.kind}
      description="Slides, heels and sandals handcrafted in-house — four decades of cobbling experience bringing you comfort and design in a single pair."
    />
  );
}
