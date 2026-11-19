import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ShopClient from './ShopClient';

export const revalidate = 60;

export default async function ShopPage() {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  // /shop shows the merged catalog; hide jewellery unless the admin toggle
  // is on (matches the store's `useVisibleProductsData` filter).
  const visibleProducts = settings?.jewelryEnabled
    ? products
    : products.filter(
        (p) =>
          (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );

  return (
    <>
      <DataInitializer
        initialProducts={products}
        initialSettings={settings}
        realtime={false}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Shop' }]} />
      </div>
      <ShopClient initialProducts={visibleProducts} />
    </>
  );
}
