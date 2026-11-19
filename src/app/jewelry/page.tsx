import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JewelrySeoSection from '@/components/seo/JewelrySeoSection';
import JewelryClient from './JewelryClient';

export const revalidate = 60;

export default async function JewelryPage() {
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
        <Breadcrumbs items={[{ label: 'Jewellery' }]} />
      </div>
      <JewelryClient
        initialJewelryEnabled={settings?.jewelryEnabled === true}
        initialProducts={jewelryProducts}
      />
      {settings?.jewelryEnabled === true && (
        <JewelrySeoSection products={jewelryProducts} full={false} />
      )}
    </>
  );
}
