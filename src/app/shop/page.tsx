import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import DataInitializer from '@/components/DataInitializer';
import ShopClient from './ShopClient';

export const revalidate = 60;

export default async function ShopPage() {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  return (
    <>
      <DataInitializer
        initialProducts={products}
        initialSettings={settings}
        realtime={false}
      />
      <ShopClient />
    </>
  );
}
