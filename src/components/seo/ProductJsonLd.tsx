import type { Product } from '@/types';
import { STORE_CONFIG } from '@/lib/constants';
import { productHandle } from '@/lib/utils';

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const url = `${STORE_CONFIG.siteUrl}/product/${productHandle(product)}`;
  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.image]
  ).filter(Boolean);

  const availability =
    product.stock && product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  // Prices don't expire, but Google Merchant flags offers with no
  // priceValidUntil — set it a year out so free Shopping listings stay valid.
  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

  // Shipping + return policy in the offer are what qualify a product for
  // Google's free Shopping listings. Values mirror the on-site policy:
  // Rs 250 flat delivery nationwide (free over Rs 4,500), 4–5 day transit,
  // 7-day returns with the customer covering return postage.
  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: String(STORE_CONFIG.deliveryFee),
      currency: 'PKR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'PK',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 4,
        maxValue: 5,
        unitCode: 'DAY',
      },
    },
  };

  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'PK',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnByMail',
    // Change-of-mind returns: the customer pays return postage (per the
    // published return policy) — so this is NOT a FreeReturn.
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  };

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
    // Only set when the admin has explicitly confirmed it for this product —
    // never inferred from name/appearance. See ProductMaterial.
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: STORE_CONFIG.name,
      },
      shippingDetails,
      hasMerchantReturnPolicy: returnPolicy,
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
