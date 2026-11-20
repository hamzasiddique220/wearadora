'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData } from '@/lib/stores/data';
import { STORE_CONFIG } from '@/lib/constants';
import { jewelryCategoryHref } from '@/lib/categories';
import { mergeSettings } from '@/lib/defaults/siteSettings';
import type { Product, SiteSettings } from '@/types';

interface JewelryClientProps {
  /** Server-fetched flag — used until the client store hydrates. */
  initialJewelryEnabled?: boolean;
  /** Pre-filtered jewellery products fetched on the server for SSR grid. */
  initialProducts?: Product[];
  /** Server-fetched settings doc — so the FIRST render (SSR) already shows
   *  the admin-chosen hero, not the default stock photo. */
  initialSettings?: SiteSettings | null;
}

export default function JewelryClient({
  initialJewelryEnabled = false,
  initialProducts,
  initialSettings,
}: JewelryClientProps) {
  const { settings: storeSettings, loading } = useSiteSettingsData();
  // The store hydrates in an effect, i.e. AFTER the first render — until
  // then use the server's copy instead of the built-in defaults.
  const settings = useMemo(
    () => (loading && initialSettings ? mergeSettings(initialSettings) : storeSettings),
    [loading, initialSettings, storeSettings]
  );
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
          Our jewellery collection is{' '}
          <span className="font-italic-serif text-bronze">on its way</span>
        </h1>
        <p className="text-mocha leading-relaxed mb-8 text-sm md:text-base">
          We&rsquo;re putting the final touches on a handcrafted jewellery line.
          In the meantime, explore our signature footwear collection.
        </p>
        <Link href="/shoes" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Shop Footwear
        </Link>
      </div>
    );
  }

  return (
    <CategoryPage
      productType="jewelry"
      eyebrow="✦ The Jewellery Collection"
      title="Artificial Jewellery Online in Pakistan"
      heroImage={settings.jewelryHero.image}
      heroKind={settings.jewelryHero.kind}
      description={`Handcrafted American diamond necklace sets, bridal chokers, earrings, bracelets and rings. Free delivery from Rs ${STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')} and cash on delivery nationwide.`}
      cta={{ label: 'Shop Necklace Sets', href: jewelryCategoryHref('Necklace') }}
      searchPlaceholder="Search necklaces, earrings, rings…"
      itemNoun="jewellery"
      initialProducts={initialProducts}
    />
  );
}
