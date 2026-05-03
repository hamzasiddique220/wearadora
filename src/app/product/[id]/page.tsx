import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProduct, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import ProductDetail from './ProductDetail';
import ProductJsonLd from '@/components/seo/ProductJsonLd';

interface PageProps {
  params: { id: string };
}

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
  const [product, settings] = await Promise.all([
    fetchProduct(params.id),
    fetchSiteSettings(),
  ]);

  if (product) {
    const isJewelry =
      (product.productType || getProductType(product.category as string)) ===
      'jewelry';
    if (isJewelry && settings?.jewelryEnabled !== true) {
      notFound();
    }
  }

  return (
    <>
      {product && <ProductJsonLd product={product} />}
      <ProductDetail id={params.id} />
    </>
  );
}
