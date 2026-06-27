import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JewelryClient from './JewelryClient';

export const revalidate = 60;

export default async function JewelryPage() {
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Jewelry' }]} />
      </div>
      <JewelryClient />
    </>
  );
}
