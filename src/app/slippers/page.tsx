import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import DataInitializer from '@/components/DataInitializer';
import SlippersClient from './SlippersClient';

export const revalidate = 60;

export default async function SlippersPage() {
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
      <SlippersClient />
    </>
  );
}
