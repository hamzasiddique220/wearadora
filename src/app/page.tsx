import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import DataInitializer from '@/components/DataInitializer';
import HomeShell from './HomeShell';

export const revalidate = 60;

export default async function HomePage() {
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
      <HomeShell />
    </>
  );
}
