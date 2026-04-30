import type { MetadataRoute } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*', '/cart', '/wishlist'],
      },
    ],
    sitemap: `${STORE_CONFIG.siteUrl}/sitemap.xml`,
    host: STORE_CONFIG.siteUrl,
  };
}
