import { STORE_CONFIG, getProductType } from '@/lib/constants';
import { productHandle } from '@/lib/utils';
import {
  fetchAllProducts,
  fetchSiteSettings,
} from '@/lib/server/firestoreRest';
import type { Product } from '@/types';

/**
 * Meta (Facebook / Instagram) catalog product feed — RSS 2.0 with the
 * Google `g:` namespace, which Meta Commerce Manager ingests directly.
 *
 * Connect it once in Commerce Manager → Catalog → Data Sources →
 * "Scheduled feed" using https://wearadora.com/facebook-feed.xml. Products
 * can then be tagged in Instagram/Facebook posts for free shopping traffic.
 *
 * Spec: https://developers.facebook.com/docs/commerce-platform/catalog/fields
 */
export const revalidate = 3600;

// Meta's top-level Google product categories.
const GOOGLE_CATEGORY = {
  slippers: 'Apparel & Accessories > Shoes',
  jewelry: 'Apparel & Accessories > Jewelry',
} as const;

function escapeXml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanText(input: string, max = 5000): string {
  // Product descriptions are stored with markdown (**bold**, * bullets,
  // # headers). Meta shows the feed text verbatim, so strip the syntax
  // markers first, then collapse whitespace to a single line.
  const stripped = input
    .replace(/[*_#`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? `${stripped.slice(0, max - 1)}…` : stripped;
}

function buildItem(product: Product): string | null {
  const image = product.images?.[0] || product.image;
  if (!image || !product.price || product.price <= 0) return null;

  const type = product.productType || getProductType(product.category as string);
  const id = product.sku?.trim() || product.id;
  const link = `${STORE_CONFIG.siteUrl}/product/${productHandle(product)}`;
  const availability =
    product.stock && product.stock > 0 ? 'in stock' : 'out of stock';
  const description = cleanText(
    product.description ||
      `Handcrafted ${product.category} by ${STORE_CONFIG.name}.`
  );

  // When there's a strike-through original price, `price` = the higher
  // regular price and `sale_price` = the discounted one Meta should show.
  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;
  const regularPrice = hasDiscount ? product.originalPrice! : product.price;

  const extraImages = (product.images || [])
    .slice(1, 11)
    .filter((u) => u && u !== image)
    .map(
      (u) => `    <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>`
    )
    .join('\n');

  return [
    '  <item>',
    `    <g:id>${escapeXml(id)}</g:id>`,
    `    <g:title>${escapeXml(cleanText(product.name, 150))}</g:title>`,
    `    <g:description>${escapeXml(description)}</g:description>`,
    `    <g:link>${escapeXml(link)}</g:link>`,
    `    <g:image_link>${escapeXml(image)}</g:image_link>`,
    extraImages,
    `    <g:availability>${availability}</g:availability>`,
    '    <g:condition>new</g:condition>',
    `    <g:price>${regularPrice} PKR</g:price>`,
    hasDiscount ? `    <g:sale_price>${product.price} PKR</g:sale_price>` : '',
    `    <g:brand>${escapeXml(STORE_CONFIG.name)}</g:brand>`,
    `    <g:google_product_category>${escapeXml(GOOGLE_CATEGORY[type])}</g:google_product_category>`,
    `    <g:product_type>${escapeXml(product.category)}</g:product_type>`,
    '    <g:identifier_exists>no</g:identifier_exists>',
    '  </item>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function GET(): Promise<Response> {
  const [products, settings] = await Promise.all([
    fetchAllProducts(),
    fetchSiteSettings(),
  ]);
  const jewelryEnabled = settings?.jewelryEnabled === true;

  // Respect the jewelry master switch so hidden products never leak into the
  // public catalog feed.
  const visible = jewelryEnabled
    ? products
    : products.filter(
        (p) =>
          (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );

  const items = visible
    .map(buildItem)
    .filter((x): x is string => x !== null)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(STORE_CONFIG.name)} — Product Catalog</title>
  <link>${STORE_CONFIG.siteUrl}</link>
  <description>Handcrafted ladies footwear and artificial jewellery from Wear Adora, Karachi.</description>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
