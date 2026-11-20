import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SlippersClient from './SlippersClient';
import SlippersSeoSection from './SlippersSeoSection';

export const revalidate = 60;

export default async function SlippersPage() {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  const slippersProducts = products.filter(
    (p) => (p.productType || getProductType(p.category as string)) === 'slippers'
  );

  return (
    <>
      <DataInitializer
        initialProducts={products}
        initialSettings={settings}
        realtime={false}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Shoes' }]} />
      </div>
      <SlippersClient initialProducts={slippersProducts} initialSettings={settings} />
      <SlippersSeoSection products={slippersProducts} />
    </>
  );
}
