import type { Metadata } from 'next';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AmericanDiamondClient from './AmericanDiamondClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `American Diamond Jewellery Online in Pakistan | ${STORE_CONFIG.name}`,
  description:
    'Shop affordable American diamond (zircon) jewellery in Pakistan — necklace sets, bridal choker sets, earrings & bracelets with a premium finish. Free delivery on orders Rs 3,000+ & 7-day returns.',
  alternates: {
    canonical: '/collections/american-diamond-jewellery',
  },
  keywords: [
    'american diamond',
    'american diamond jewellery',
    'american diamond jewellery Pakistan',
    'zircon jewellery',
    'zircon necklace set',
    'bridal choker set',
    'artificial jewellery Pakistan',
    'cubic zirconia jewellery',
    'wedding jewellery',
    'wearadora',
  ],
  openGraph: {
    title: `American Diamond Jewellery | ${STORE_CONFIG.name}`,
    description:
      'Handcrafted American diamond (zircon) jewellery — necklace sets, bridal chokers, earrings & bracelets. Free delivery on orders Rs 3,000+ across Pakistan.',
    url: `${STORE_CONFIG.siteUrl}/collections/american-diamond-jewellery`,
    type: 'website',
  },
};

export default async function AmericanDiamondCollectionPage() {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  const jewelryProducts = products.filter(
    (p) => (p.productType || getProductType(p.category as string)) === 'jewelry'
  );

  return (
    <>
      <DataInitializer
        initialProducts={products}
        initialSettings={settings}
        realtime={false}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'American Diamond Jewellery' }]} />
      </div>

      {settings?.jewelryEnabled && (
        <section
          className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pt-6 md:pt-10 text-center"
          aria-labelledby="ad-collection-intro"
        >
          <p
            id="ad-collection-intro"
            className="text-mocha leading-relaxed text-sm md:text-base"
          >
            Discover {STORE_CONFIG.name}&rsquo;s{' '}
            <strong className="text-charcoal">American diamond jewellery</strong>{' '}
            — also known as{' '}
            <strong className="text-charcoal">zircon</strong> or{' '}
            <strong className="text-charcoal">cubic zirconia</strong> —
            handcrafted to bring the sparkle of real diamonds at an affordable
            price. From statement necklace sets and complete bridal choker sets
            to delicate earrings and bracelets, every piece is studded with
            high-grade American diamond stones in a premium gold-tone finish.
            Perfect for weddings, barat, walima, mehndi, Eid and parties — with
            free delivery on orders over Rs 3,000 and a 7-day exchange &amp;
            return across Pakistan.
          </p>
        </section>
      )}

      <AmericanDiamondClient
        initialJewelryEnabled={settings?.jewelryEnabled === true}
        initialProducts={jewelryProducts}
      />
    </>
  );
}
