import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchAllProducts,
  fetchProduct,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import DataInitializer from '@/components/DataInitializer';
import ProductDetail from './ProductDetail';
import ProductJsonLd from '@/components/seo/ProductJsonLd';

interface PageProps {
  params: { id: string };
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [product, settings] = await Promise.all([
    fetchProduct(params.id),
    fetchSiteSettings(),
  ]);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'This item may have been removed or is no longer available.',
      robots: { index: false, follow: false },
    };
  }

  const isJewelry =
    (product.productType || getProductType(product.category as string)) ===
    'jewelry';
  if (isJewelry && settings?.jewelryEnabled !== true) {
    return {
      title: 'Product Not Found',
      description: 'This item may have been removed or is no longer available.',
      robots: { index: false, follow: false },
    };
  }

  const url = `${STORE_CONFIG.siteUrl}/product/${params.id}`;
  const image = product.images?.[0] || product.image;
  const description =
    product.description?.slice(0, 200) ||
    `${product.name} — handcrafted ${product.category} from ${STORE_CONFIG.name}.`;

  return {
    title: `${product.name} — ${product.category}`,
    description,
    alternates: { canonical: `/product/${params.id}` },
    openGraph: {
      title: `${product.name} | ${STORE_CONFIG.name}`,
      description,
      url,
      type: 'website',
      siteName: STORE_CONFIG.name,
      images: image
        ? [
            {
              url: image,
              alt: product.name,
              width: 1200,
              height: 1200,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${STORE_CONFIG.name}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const [product, allProducts, settings] = await Promise.all([
    fetchProduct(params.id),
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const isJewelry =
    (product.productType || getProductType(product.category as string)) ===
    'jewelry';
  if (isJewelry && settings?.jewelryEnabled !== true) {
    notFound();
  }

  // Pre-compute "you may also like" on the server so the client doesn't have
  // to wait for the catalog to land before rendering related cards.
  const productType = product.productType || getProductType(product.category as string);
  const visibleAll = settings?.jewelryEnabled
    ? allProducts
    : allProducts.filter(
        (p) =>
          (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );
  const related = visibleAll
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.productType || getProductType(p.category as string)) === productType
    )
    .slice(0, 4);

  return (
    <>
      <ProductJsonLd product={product} />
      <DataInitializer
        initialProducts={visibleAll}
        initialSettings={settings}
        realtime={false}
      />
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}
