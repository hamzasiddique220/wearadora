import type { MetadataRoute } from 'next';
import { STORE_CONFIG } from '@/lib/constants';

const DISALLOW = [
  '/admin',
  '/admin/*',
  '/api',
  '/api/*',
  '/cart',
  '/wishlist',
  // Internal reference doc, not a page — served from /public with no
  // on-site link, but nothing stops it being indexed if found externally.
  '/WEARADORA-Logo-Brand-Guide.md',
];

// AI assistants / answer engines. Explicitly listing them means Wear Adora
// content is eligible to be surfaced when someone asks ChatGPT / Claude /
// Perplexity / Google's Gemini something like "affordable artificial
// jewellery in Pakistan". Trade-off: public content may also be used in
// training — acceptable for a small brand building presence.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${STORE_CONFIG.siteUrl}/sitemap.xml`,
    host: STORE_CONFIG.siteUrl,
  };
}
