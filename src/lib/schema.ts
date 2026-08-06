import { STORE_CONFIG } from './constants';
import { productHandle } from './utils';
import type { Product } from '@/types';
import type { CategoryFaq } from './categories';

interface CollectionPageSchemaInput {
  name: string;
  description: string;
  url: string;
  products: Product[];
}

/** CollectionPage schema with the product list embedded as its mainEntity ItemList. */
export function buildCollectionPageSchema({
  name,
  description,
  url,
  products,
}: CollectionPageSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: STORE_CONFIG.name,
      url: STORE_CONFIG.siteUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `${STORE_CONFIG.siteUrl}/product/${productHandle(p)}`,
      })),
    },
  };
}

export function buildFaqPageSchema(faqs: CategoryFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
