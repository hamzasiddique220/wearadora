import type { Product } from '@/types';
import { STORE_CONFIG } from '@/lib/constants';

interface ProductMetaProps {
  product: Product;
}

/**
 * Product-specific Open Graph tags (the `og:type=product` + `product:*`
 * namespace). Next's Metadata API can't emit these — its OpenGraph type
 * union rejects "product" and its `other` field renders `name=` instead of
 * the `property=` that Facebook requires — so we render the raw
 * `<meta property>` tags here, the same way ProductJsonLd renders its
 * `<script>`. Facebook/WhatsApp crawlers read og/product meta from anywhere
 * in the document, so these lift the price + stock into shared links and let
 * Meta Commerce Manager match the page to a catalog item.
 */
export default function ProductMeta({ product }: ProductMetaProps) {
  const inStock = !!(product.stock && product.stock > 0);
  const amount = String(product.price);

  return (
    <>
      <meta property="og:type" content="product" />
      <meta property="product:brand" content={STORE_CONFIG.brandName} />
      <meta property="product:availability" content={inStock ? 'in stock' : 'out of stock'} />
      <meta property="product:condition" content="new" />
      <meta property="product:price:amount" content={amount} />
      <meta property="product:price:currency" content="PKR" />
      {/* og:price:* is the pair some scrapers read instead of product:price:* */}
      <meta property="og:price:amount" content={amount} />
      <meta property="og:price:currency" content="PKR" />
    </>
  );
}
