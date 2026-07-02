import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import HomeShell from './HomeShell';

export const revalidate = 60;

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  const jewelryEnabled = settings?.jewelryEnabled === true;
  // Mirror `useVisibleProductsData` server-side so the initial HTML matches
  // what the client store will resolve to after hydration.
  const visibleProducts = jewelryEnabled
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
      <HomeShell
        initialProducts={visibleProducts}
        initialJewelryEnabled={jewelryEnabled}
      />
    </>
  );
}
