import { STORE_CONFIG, SLIPPER_SIZES } from '@/lib/constants';
import { productHandle, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface SlippersSeoSectionProps {
  products: Product[];
}

/**
 * Server-rendered SEO/GEO block for /slippers: plain-text answer content plus
 * ItemList + FAQPage JSON-LD. Rendered on the server so both search engines
 * and AI answer engines (which cite pages that answer questions in plain
 * text) see it in the initial HTML regardless of client hydration.
 *
 * The visible FAQ and the FAQPage schema are built from the SAME `faqs`
 * array, so they always match exactly — Google penalises FAQ schema that
 * doesn't mirror the on-page text.
 */
export default function SlippersSeoSection({ products }: SlippersSeoSectionProps) {
  const prices = products.map((p) => p.price).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 1700;
  const maxPrice = prices.length ? Math.max(...prices) : 3200;
  const range = `${formatPrice(minPrice)} to ${formatPrice(maxPrice)}`;
  const sizeRange = `${SLIPPER_SIZES[0]} to ${SLIPPER_SIZES[SLIPPER_SIZES.length - 1]}`;
  const freeOver = formatPrice(STORE_CONFIG.freeDeliveryMinTotal);

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'What is the price range of ladies shoes at Wear Adora?',
      answer: `Ladies shoes at Wear Adora range from ${range}, including kitten heels, block heel sandals, party heels, flats and slides — all handcrafted in Karachi.`,
    },
    {
      question: 'Is cash on delivery available across Pakistan?',
      answer: `Yes, cash on delivery is available nationwide across Pakistan. Delivery takes ${STORE_CONFIG.deliveryDays}, and delivery is free on orders above ${freeOver}.`,
    },
    {
      question: "Can I exchange shoes if the size doesn't fit?",
      answer:
        'Yes, Wear Adora offers a 7-day easy exchange policy on all footwear. Just contact us within 7 days of delivery to arrange an exchange.',
    },
    {
      question: 'What shoe sizes are available?',
      answer: `Most designs are available in sizes ${sizeRange}. The exact sizes in stock are shown on each product page.`,
    },
    {
      question: 'Are Wear Adora shoes handmade?',
      answer:
        'Yes. Every pair is handcrafted in-house in Karachi, backed by more than 40 years of shoemaking experience.',
    },
  ];

  // ItemList — helps search + AI engines understand the products on this page.
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ladies Shoes — Wear Adora',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${STORE_CONFIG.siteUrl}/product/${productHandle(p)}`,
    })),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24 pt-4">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />

      <div className="border-t border-stone pt-10 md:pt-14">
        <span className="text-[10px] tracking-[0.35em] uppercase text-bronze">
          ✦ About the Collection
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mt-3 mb-4">
          Handcrafted Ladies Shoes — Made in Karachi
        </h2>
        <p className="text-mocha leading-relaxed text-sm md:text-base">
          Wear Adora offers handcrafted ladies shoes online in Pakistan — kitten
          heels, block heel sandals, flat slides, embellished party heels and
          everyday flats, priced between {formatPrice(minPrice)} and{' '}
          {formatPrice(maxPrice)}. Every pair is made in-house in Karachi with
          more than 40 years of cobbling craftsmanship. We deliver nationwide in{' '}
          {STORE_CONFIG.deliveryDays} with cash on delivery, free delivery on
          orders above {freeOver}, and a 7-day easy exchange.
        </p>
      </div>

      <div className="mt-10 md:mt-14">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mb-6">
          Frequently Asked Questions
        </h2>
        <dl className="divide-y divide-stone">
          {faqs.map((f) => (
            <div key={f.question} className="py-4 md:py-5">
              <dt className="font-serif text-base md:text-lg text-charcoal mb-1.5">
                {f.question}
              </dt>
              <dd className="text-mocha leading-relaxed text-sm md:text-base">
                {f.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
