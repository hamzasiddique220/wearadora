'use client';

import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function JewelryPage() {
  const { settings } = useSiteSettings();
  return (
    <CategoryPage
      productType="jewelry"
      eyebrow="✦ The Jewelry Collection"
      title="Handcrafted Jewelry"
      heroImage={settings.jewelryHero.image}
      heroKind={settings.jewelryHero.kind}
      description="Timeless pieces that tell a story — from delicate necklaces to statement rings, each crafted for those who cherish refined elegance."
    />
  );
}
