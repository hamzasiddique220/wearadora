import type { Metadata } from 'next';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JewelrySeoSection from '@/components/seo/JewelrySeoSection';
import AmericanDiamondClient from './AmericanDiamondClient';

export const revalidate = 60;

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's `| WEARADORA` template — the
  // brand suffix is already part of the title string.
  title: {
    absolute: `American Diamond & Zircon Jewellery Online in Pakistan | ${STORE_CONFIG.brandName}`,
  },
  description:
    'Shop American diamond (zircon) jewellery online in Pakistan — necklace sets, bridal choker sets with maang tikka, earrings & bracelets from Rs. 449. Free delivery on orders Rs 3,000+ & 7-day exchange.',
  alternates: {
    canonical: '/collections/american-diamond-jewellery',
  },
  keywords: [
    'artificial jewellery',
    'artificial jewellery Pakistan',
    'artificial jewellery online',
    'american diamond',
    'american diamond jewellery',
    'american diamond jewellery Pakistan',
    'zircon jewellery',
    'zircon necklace set',
    'bridal choker set',
    'cubic zirconia jewellery',
    'wedding jewellery',
    'wearadora',
  ],
  openGraph: {
    title: `American Diamond & Zircon Jewellery Online in Pakistan | ${STORE_CONFIG.brandName}`,
    description:
      'American diamond (zircon) necklace sets, bridal chokers, earrings & bracelets from Rs. 449. Free delivery on orders Rs 3,000+ across Pakistan.',
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
        <Breadcrumbs items={[{ label: 'Artificial Jewellery' }]} />
      </div>

      <AmericanDiamondClient
        initialJewelryEnabled={settings?.jewelryEnabled === true}
        initialProducts={jewelryProducts}
      />
      {settings?.jewelryEnabled === true && (
        <JewelrySeoSection products={jewelryProducts} />
      )}
    </>
  );
}
