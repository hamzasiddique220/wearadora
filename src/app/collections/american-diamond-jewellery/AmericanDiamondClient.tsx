'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData } from '@/lib/stores/data';
import type { Product } from '@/types';

interface AmericanDiamondClientProps {
  initialJewelryEnabled?: boolean;
  initialProducts?: Product[];
}

export default function AmericanDiamondClient({
  initialJewelryEnabled = false,
  initialProducts,
}: AmericanDiamondClientProps) {
  const { settings, loading } = useSiteSettingsData();
  const jewelryEnabled = loading
    ? initialJewelryEnabled
    : settings.jewelryEnabled;

  if (!jewelryEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
        <div className="w-16 h-16 bg-bronze/10 text-bronze rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={26} />
        </div>
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Coming Soon
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
          Our American diamond collection is{' '}
          <span className="font-italic-serif text-bronze">on its way</span>
        </h1>
        <p className="text-mocha leading-relaxed mb-8 text-sm md:text-base">
          We&rsquo;re putting the final touches on a handcrafted American
          diamond (zircon) line. In the meantime, explore our signature
          footwear collection.
        </p>
        <Link href="/slippers" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Shop Footwear
        </Link>
      </div>
    );
  }

  return (
    <CategoryPage
      productType="jewelry"
      eyebrow="✦ Artificial Jewellery"
      title="Artificial Jewellery"
      heroImage={settings.jewelryHero.image}
      heroKind={settings.jewelryHero.kind}
      description="Affordable artificial jewellery in Pakistan — American diamond (zircon / cubic zirconia) necklace sets, bridal chokers, earrings and bracelets that sparkle at everyday prices."
      initialProducts={initialProducts}
    />
  );
}
