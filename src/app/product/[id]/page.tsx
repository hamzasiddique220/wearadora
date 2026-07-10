import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  fetchAllProducts,
  fetchProductByHandle,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import { productHandle, formatPrice } from '@/lib/utils';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductDetail from './ProductDetail';
import ProductJsonLd from '@/components/seo/ProductJsonLd';
import ProductMeta from '@/components/seo/ProductMeta';

interface PageProps {
  params: { id: string };
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [match, settings] = await Promise.all([
    fetchProductByHandle(params.id),
    fetchSiteSettings(),
  ]);

  if (!match) {
    return {
      title: 'Product Not Found',
      description: 'This item may have been removed or is no longer available.',
      robots: { index: false, follow: false },
    };
  }

  const { product } = match;
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

  const handle = productHandle(product);
  const url = `${STORE_CONFIG.siteUrl}/product/${handle}`;
  const image = product.images?.[0] || product.image;

  // Jewellery pieces are all zircon/American diamond — bake that into the
  // <title> and meta description so search intent for "American diamond"
  // matches, and always suffix with the trust signals customers scan for.
  const categoryPart = isJewelry
    ? `Zircon (American Diamond) ${product.category}`
    : product.category;
  const trustSuffix = ' Free delivery on Rs 3,000+ orders & 7-day returns across Pakistan.';
  const baseDescription =
    product.description?.slice(0, 155) ||
    `${product.name} — handcrafted ${product.category} from ${STORE_CONFIG.name}.`;
  const description = `${baseDescription}${
    baseDescription.endsWith('.') ? '' : '.'
  }${trustSuffix}`;

  // Price in the share title is what actually surfaces in WhatsApp/Facebook
  // link previews (they show og:title, not the product:price meta). The
  // `og:type=product` + `product:price:*` tags are emitted separately by
  // <ProductMeta> — `type` is intentionally omitted here so there's exactly
  // one og:type in the document.
  const shareTitle = `${product.name} – ${formatPrice(product.price)}`;

  return {
    title: `${product.name} – ${categoryPart}`,
    description,
    alternates: { canonical: `/product/${handle}` },
    openGraph: {
      title: shareTitle,
      description,
      url,
      siteName: STORE_CONFIG.brandName,
      locale: 'en_PK',
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
      title: shareTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const [match, allProducts, settings] = await Promise.all([
    fetchProductByHandle(params.id),
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  if (!match) {
    notFound();
  }

  const { product, matchedBy } = match;

  // Legacy id-based URL → 308 redirect to canonical slug URL for SEO.
  if (matchedBy === 'id' && product.slug && product.slug !== params.id) {
    permanentRedirect(`/product/${product.slug}`);
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

  const categoryLabel = productType === 'jewelry' ? 'Jewelry' : 'Shoes';
  const categoryHref = productType === 'jewelry' ? '/jewelry' : '/slippers';

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductMeta product={product} />
      <DataInitializer
        initialProducts={visibleAll}
        initialSettings={settings}
        realtime={false}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs
          items={[
            { label: categoryLabel, href: categoryHref },
            { label: product.name },
          ]}
        />
      </div>
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}
