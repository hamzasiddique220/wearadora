import type { MetadataRoute } from 'next';
import { STORE_CONFIG, getProductType } from '@/lib/constants';
import { productHandle } from '@/lib/utils';
import { listBlogPosts } from '@/lib/blog';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = STORE_CONFIG.siteUrl;
  const now = new Date();

  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);
  const jewelryEnabled = settings?.jewelryEnabled === true;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...(jewelryEnabled
      ? [
          {
            url: `${base}/jewelry`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          },
        ]
      : []),
    { url: `${base}/slippers`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/return-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const blogEntries: MetadataRoute.Sitemap = listBlogPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const visibleProducts = jewelryEnabled
    ? products
    : products.filter(
        (p) =>
          (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );

  const productEntries: MetadataRoute.Sitemap = visibleProducts.map((p) => ({
    url: `${base}/product/${productHandle(p)}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries, ...productEntries];
}
