import type { Product } from '@/types';
import { STORE_CONFIG } from '@/lib/constants';

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const url = `${STORE_CONFIG.siteUrl}/product/${product.id}`;
  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.image]
  ).filter(Boolean);

  const availability =
    product.stock && product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: STORE_CONFIG.name,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: STORE_CONFIG.name,
      },
      ...(product.originalPrice && product.originalPrice > product.price
        ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: product.originalPrice, priceCurrency: 'PKR' } }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
