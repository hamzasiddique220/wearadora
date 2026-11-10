import { STORE_CONFIG, SOCIAL_LINKS, CONTACT_PHONE, DELIVERY_TEXT, DELIVERY_TIMES } from '@/lib/constants';
import { JEWELRY_CATEGORY_DEFS } from '@/lib/categories';
import { SLIPPERS_CATEGORY_DEFS } from '@/lib/footwearCategories';
import { fetchAllProducts, fetchSiteSettings } from '@/lib/server/firestoreRest';
import { formatPriceRange, getPriceRange, visibleProducts } from '@/lib/priceRange';

// Generated (not a static /public file) so the price range and jewelry
// section always match the live catalog and the Organization schema.
export const revalidate = 3600;

export async function GET() {
  const base = STORE_CONFIG.siteUrl;
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);
  const jewelryEnabled = settings?.jewelryEnabled === true;
  const range = getPriceRange(visibleProducts(products, jewelryEnabled));
  const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');
  const link = (label: string, path: string) => `- [${label}](${base}${path})`;

  const summary = jewelryEnabled
    ? `Pakistani online store selling handcrafted ladies footwear (heels, sandals and slides) made in Karachi with 40+ years of shoemaking experience, and handcrafted American diamond (artificial) jewelry. Cash on delivery, nationwide delivery across Pakistan.`
    : `Pakistani online store selling handcrafted ladies footwear (heels, sandals and slides) made in Karachi with 40+ years of shoemaking experience. Cash on delivery, nationwide delivery across Pakistan.`;

  const lines = [
    `# ${STORE_CONFIG.name}`,
    '',
    `> ${summary}`,
    '',
    '## Business',
    `- Name: ${STORE_CONFIG.name} (wordmark "WEARADORA"; tagline "${STORE_CONFIG.tagline}")`,
    '- Based in: Karachi, Sindh, Pakistan — workshop and warehouse; online only (no walk-in shop), delivers nationwide',
    `- Website: ${base}`,
    `- Contact: call or WhatsApp ${CONTACT_PHONE.display} (${CONTACT_PHONE.international}), available 24/7 · ${STORE_CONFIG.email}`,
    '',
    '## Products',
    '- **Ladies footwear (handcrafted in Karachi)**: heels, sandals and slides.',
    ...(jewelryEnabled
      ? [
          '- **Handcrafted American diamond (artificial) jewelry**: necklace sets, bridal sets, earrings, rings, bangles/bracelets and anklets, in gold-tone, silver-tone or rose-tone finishes over base metal. Not real gold and not real diamonds.',
        ]
      : []),
    ...(range ? [`- Price range: ${formatPriceRange(range)} (PKR, live catalog)`] : []),
    '',
    '## Delivery, payment & returns',
    `- Free delivery on orders of Rs ${free} and above; Rs ${STORE_CONFIG.deliveryFee} flat charge below that.`,
    `- Delivery time: Karachi ${DELIVERY_TEXT.karachi}; rest of Pakistan ${DELIVERY_TEXT.restOfPakistan}. Urgent delivery with online payment: ${DELIVERY_TIMES.urgent.karachi} working day (Karachi), ${DELIVERY_TIMES.urgent.punjab} working days (Punjab).`,
    '- Payment: Cash on Delivery anywhere in Pakistan; also bank transfer, Easypaisa and JazzCash.',
    '- Returns: 7-day exchange & return on unused items in original packaging (earrings are exchange-only).',
    '- Damaged / defective / wrong items: report within 48 hours of delivery; Wear Adora covers return shipping.',
    '- Ordering: website checkout (confirmed by call/WhatsApp before shipping) or directly on WhatsApp.',
    '',
    '## Categories',
    link('Shoes / footwear', '/slippers'),
    ...SLIPPERS_CATEGORY_DEFS.map((d) => link(d.plural, `/slippers/${d.slug}`)),
    ...(jewelryEnabled
      ? [
          link('Jewelry', '/jewelry'),
          ...JEWELRY_CATEGORY_DEFS.map((d) => link(d.plural, `/jewelry/${d.slug}`)),
        ]
      : []),
    link('Full shop', '/shop'),
    '',
    '## Key pages',
    link('Home', '/'),
    link('About', '/about'),
    link('Contact', '/contact'),
    link('FAQs', '/faq'),
    link('Shipping & delivery', '/shipping'),
    link('Return & exchange policy', '/return-policy'),
    link('Privacy policy', '/privacy'),
    link('Terms & conditions', '/terms'),
    link('Journal (style guides & care tips)', '/blog'),
    '',
    '## Social',
    `- [Instagram](${SOCIAL_LINKS.instagram})`,
    `- [Facebook](${SOCIAL_LINKS.facebook})`,
    `- [TikTok](${SOCIAL_LINKS.tiktok})`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
