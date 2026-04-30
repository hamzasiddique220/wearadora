import type { MetadataRoute } from 'next';
import { STORE_CONFIG } from '@/lib/constants';
import { fetchAllProducts } from '@/lib/server/firestoreRest';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = STORE_CONFIG.siteUrl;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/jewelry`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/slippers`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const products = await fetchAllProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
