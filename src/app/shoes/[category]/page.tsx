import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { getProductType, normalizeCategory, STORE_CONFIG } from '@/lib/constants';
import {
  getSlippersCategoryDef,
  SLIPPERS_CATEGORY_SLUGS,
  relatedSlippersCategoryDefs,
} from '@/lib/footwearCategories';
import {
  DEFAULT_CATEGORY_IMAGES,
  DEFAULT_SLIPPERS_HERO,
} from '@/lib/defaults/siteSettings';
import { buildCategoryMetadata, NOT_FOUND_METADATA } from '@/lib/seo';
import { buildCollectionPageSchema } from '@/lib/schema';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CategoryBanner from '@/components/category/CategoryBanner';
import CategoryDescription from '@/components/category/CategoryDescription';
import CategoryFAQ from '@/components/category/CategoryFAQ';
import CategoryNavigation from '@/components/category/CategoryNavigation';
import ProductGrid from '@/components/category/ProductGrid';

interface PageProps {
  params: { category: string };
  searchParams: { page?: string };
}

const PAGE_SIZE = 24;

export const revalidate = 60;

export function generateStaticParams() {
  return SLIPPERS_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const def = getSlippersCategoryDef(params.category);
  if (!def) return NOT_FOUND_METADATA;

  const settings = await fetchSiteSettings();
  const image = settings?.categoryImages?.[def.category] || DEFAULT_CATEGORY_IMAGES[def.category];
  return buildCategoryMetadata(def, { image, basePath: '/shoes' });
}

export default async function SlippersCategoryPage({ params, searchParams }: PageProps) {
  const def = getSlippersCategoryDef(params.category);
  if (!def) notFound();

  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  const categoryProducts = products.filter((p) => {
    const type = p.productType || getProductType(p.category as string);
    return type === 'slippers' && normalizeCategory(p.category as string) === def.category;
  });

  const requestedPage = parseInt(searchParams?.page || '1', 10);
  const totalPages = Math.max(1, Math.ceil(categoryProducts.length / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, Number.isNaN(requestedPage) ? 1 : requestedPage),
    totalPages
  );
  const pagedProducts = categoryProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const bannerImage =
    settings?.categoryImages?.[def.category] ||
    DEFAULT_CATEGORY_IMAGES[def.category] ||
    DEFAULT_SLIPPERS_HERO.image;

  const collectionSchema = buildCollectionPageSchema({
    name: def.h1,
    description: def.metaDescription,
    url: `${STORE_CONFIG.siteUrl}/shoes/${def.slug}`,
    products: categoryProducts,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <DataInitializer
        initialProducts={products}
        initialSettings={settings}
        realtime={false}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs
          items={[{ label: 'Shoes', href: '/shoes' }, { label: def.plural }]}
        />
      </div>
      <CategoryBanner def={def} image={bannerImage} eyebrow="✦ The Footwear Collection" />
      <ProductGrid
        products={pagedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/shoes/${def.slug}`}
        emptyMessage={`No ${def.plural.toLowerCase()} in stock right now — check back soon or browse the full footwear collection.`}
      />
      <CategoryDescription def={def} />
      <CategoryFAQ def={def} products={categoryProducts} />
      <CategoryNavigation
        others={relatedSlippersCategoryDefs(def.slug)}
        basePath="/shoes"
        viewAll={{ href: '/shoes', label: 'View All Footwear' }}
      />
    </>
  );
}
