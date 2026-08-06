import type { Metadata } from 'next';
import { STORE_CONFIG } from './constants';
import type { CategoryDef } from './categories';

/**
 * Metadata for a /[vertical]/[category] page. `page` > 1 still points its
 * canonical at the base category URL — Google indexes the category by its
 * first page, and this collection is small enough that deep pagination
 * pages don't need to compete for their own listing.
 */
export function buildCategoryMetadata(
  def: CategoryDef,
  opts: { image?: string; basePath?: string } = {}
): Metadata {
  const basePath = opts.basePath || '/jewelry';
  const url = `${STORE_CONFIG.siteUrl}${basePath}/${def.slug}`;

  return {
    title: { absolute: `${def.seoTitle}` },
    description: def.metaDescription,
    keywords: def.keywords,
    alternates: { canonical: `${basePath}/${def.slug}` },
    openGraph: {
      title: `${def.h1} | ${STORE_CONFIG.name}`,
      description: def.metaDescription,
      url,
      siteName: STORE_CONFIG.name,
      locale: 'en_PK',
      type: 'website',
      images: opts.image
        ? [{ url: opts.image, alt: def.h1, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${def.h1} | ${STORE_CONFIG.name}`,
      description: def.metaDescription,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}

export const NOT_FOUND_METADATA: Metadata = {
  title: 'Category Not Found',
  description: 'This collection may have been removed or is no longer available.',
  robots: { index: false, follow: false },
};
