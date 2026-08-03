import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import { getProductType, normalizeCategory, STORE_CONFIG } from '@/lib/constants';
import {
  getCategoryDef,
  JEWELRY_CATEGORY_SLUGS,
} from '@/lib/categories';
import {
  DEFAULT_CATEGORY_IMAGES,
  DEFAULT_JEWELRY_HERO,
} from '@/lib/defaults/siteSettings';
import { buildCategoryMetadata, NOT_FOUND_METADATA } from '@/lib/seo';
import { buildCollectionPageSchema } from '@/lib/schema';
import DataInitializer from '@/components/DataInitializer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CategoryBanner from '@/components/jewelry/CategoryBanner';
import CategoryDescription from '@/components/jewelry/CategoryDescription';
import CategoryFAQ from '@/components/jewelry/CategoryFAQ';
import CategoryNavigation from '@/components/jewelry/CategoryNavigation';
import ProductGrid from '@/components/jewelry/ProductGrid';

interface PageProps {
  params: { category: string };
  searchParams: { page?: string };
}

const PAGE_SIZE = 24;

export const revalidate = 60;

export function generateStaticParams() {
  return JEWELRY_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const def = getCategoryDef(params.category);
  if (!def) return NOT_FOUND_METADATA;

  const settings = await fetchSiteSettings();
  if (settings?.jewelryEnabled !== true) return NOT_FOUND_METADATA;

  const image = settings?.categoryImages?.[def.category] || DEFAULT_CATEGORY_IMAGES[def.category];
  return buildCategoryMetadata(def, { image });
}

export default async function JewelryCategoryPage({ params, searchParams }: PageProps) {
  const def = getCategoryDef(params.category);
  if (!def) notFound();

  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);

  if (settings?.jewelryEnabled !== true) notFound();

  const categoryProducts = products.filter((p) => {
    const type = p.productType || getProductType(p.category as string);
    return type === 'jewelry' && normalizeCategory(p.category as string) === def.category;
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
    DEFAULT_JEWELRY_HERO.image;

  const collectionSchema = buildCollectionPageSchema({
    name: def.h1,
    description: def.metaDescription,
    url: `${STORE_CONFIG.siteUrl}/jewelry/${def.slug}`,
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
          items={[{ label: 'Jewelry', href: '/jewelry' }, { label: def.plural }]}
        />
      </div>
      <CategoryBanner def={def} image={bannerImage} />
      <ProductGrid
        products={pagedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/jewelry/${def.slug}`}
        emptyMessage={`No ${def.plural.toLowerCase()} in stock right now — check back soon or browse the full jewellery collection.`}
      />
      <CategoryDescription def={def} />
      {def.slug === 'bridal' && (
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 -mt-6 pb-10 md:pb-14 text-center">
          <Link
            href="/blog/bridal-jewellery-guide-barat-walima-mayun"
            className="text-xs tracking-[0.2em] uppercase text-bronze hover:text-charcoal inline-flex items-center gap-2"
          >
            Read Our Full Bridal Jewellery Guide (Mayun, Barat &amp; Walima)
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
      <CategoryFAQ def={def} products={categoryProducts} />
      <CategoryNavigation currentSlug={def.slug} />
    </>
  );
}
