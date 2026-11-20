'use client';

import { useMemo } from 'react';
import CategoryPage from '@/components/shop/CategoryPage';
import { useSiteSettingsData, useVisibleProductsData } from '@/lib/stores/data';
import { getProductType, STORE_CONFIG } from '@/lib/constants';
import { slippersCategoryHref } from '@/lib/footwearCategories';
import { mergeSettings } from '@/lib/defaults/siteSettings';
import type { Product, SiteSettings } from '@/types';

interface SlippersClientProps {
  initialProducts?: Product[];
  /** Server-fetched settings doc — so SSR renders the real hero, not defaults. */
  initialSettings?: SiteSettings | null;
}

export default function SlippersClient({
  initialProducts,
  initialSettings,
}: SlippersClientProps) {
  const { settings: storeSettings, loading: settingsLoading } = useSiteSettingsData();
  const { products: storeProducts, loading: productsLoading } = useVisibleProductsData();
  // The store hydrates in an effect (after the first render). Until then use
  // the server's data, so the first paint is the same hero the client ends
  // up showing — no default-image flash, no slideshow swap.
  const settings = useMemo(
    () => (settingsLoading && initialSettings ? mergeSettings(initialSettings) : storeSettings),
    [settingsLoading, initialSettings, storeSettings]
  );
  const products = productsLoading && initialProducts ? initialProducts : storeProducts;

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
      // "40+ years" appears ONCE on this screen (in the paragraph) — the
      // announcement bar no longer repeats it and the old chips are gone.
      eyebrow="✦ The Footwear Collection"
      title="Ladies Shoes Online in Pakistan"
      heroImage={settings.slippersHero.image}
      heroImages={heroImages}
      heroKind={settings.slippersHero.kind}
      description={`Heels, slides, sandals and flats, handcrafted in Karachi with 40+ years of shoemaking experience. Free delivery from Rs ${STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')} and cash on delivery nationwide.`}
      cta={{ label: 'Shop Heels', href: slippersCategoryHref('Heels') }}
      searchPlaceholder="Search heels, sandals, slides…"
      itemNoun="shoes"
      initialProducts={initialProducts}
    />
  );
}
