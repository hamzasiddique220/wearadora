import { STORE_CONFIG } from '@/lib/constants';
import { productHandle, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface JewelrySeoSectionProps {
  products: Product[];
  /**
   * `true` (default) renders the visible content block + FAQ + FAQPage schema
   * — used on the primary jewellery SEO page. `false` renders only the
   * ItemList JSON-LD, so a secondary page (e.g. /jewelry) still gets the
   * product list schema without duplicating the visible prose/FAQ.
   */
  full?: boolean;
}

/**
 * Server-rendered SEO/GEO block for the jewellery collection: plain-text
 * answer content + ItemList (and optionally FAQPage) JSON-LD, so search
 * engines and AI answer engines can read and cite it from the initial HTML.
 * The visible FAQ and the FAQPage schema share one `faqs` array so they
 * always match exactly.
 */
export default function JewelrySeoSection({
  products,
  full = true,
}: JewelrySeoSectionProps) {
  const prices = products.map((p) => p.price).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 449;
  const maxPrice = prices.length ? Math.max(...prices) : 2499;
  const range = `${formatPrice(minPrice)} to ${formatPrice(maxPrice)}`;
  const freeOver = formatPrice(STORE_CONFIG.freeDeliveryMinTotal);

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'What is artificial (American diamond) jewellery?',
      answer:
        'Artificial jewellery — also called fashion or bridal jewellery — is made with American diamond (zircon / cubic zirconia) stones set in gold-, silver- or rose-tone plated metal. It shines like real diamond jewellery at a fraction of the price. It is not solid gold and does not contain real diamonds.',
    },
    {
      question: 'What is the price range of jewellery at Wear Adora?',
      answer: `Jewellery at Wear Adora ranges from ${range}, including zircon necklace sets, bridal choker sets with maang tikka, earrings, bracelets and rings — all handcrafted in Pakistan.`,
    },
    {
      question: 'Is cash on delivery available across Pakistan?',
      answer: `Yes, cash on delivery is available nationwide across Pakistan. Delivery takes ${STORE_CONFIG.deliveryDays}, and delivery is free on orders above ${freeOver}.`,
    },
    {
      question: 'Can I return or exchange the jewellery?',
      answer:
        'Yes, we offer a 7-day exchange and refund on unused items in their original packaging. For hygiene reasons, earrings can be exchanged but not returned for a refund unless they arrive damaged.',
    },
    {
      question: 'Is this jewellery suitable for bridal and wedding wear?',
      answer:
        'Yes. Our bridal choker sets, necklace sets with maang tikka and statement earrings are designed for barat, walima, mehndi, engagements and Eid — the American diamond stones give a full bridal sparkle without the cost of real diamonds.',
    },
    {
      question: "How do I care for the jewellery so it doesn't tarnish?",
      answer:
        'Keep it away from water, perfume and chemicals, store each piece separately in a dry pouch or box, and wipe gently with a soft cloth after use. This keeps the gold- or silver-tone finish bright for much longer.',
    },
  ];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Artificial Jewellery — Wear Adora',
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

  const itemListScript = (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
    />
  );

  // Secondary page (e.g. /jewelry): product-list schema only — no visible
  // prose or FAQ, so it doesn't duplicate the primary collection page.
  if (!full) return itemListScript;

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24 pt-4">
      {itemListScript}
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
          Artificial &amp; American Diamond Jewellery — Made in Pakistan
        </h2>
        <p className="text-mocha leading-relaxed text-sm md:text-base">
          Wear Adora offers handcrafted artificial jewellery online in Pakistan
          — American diamond (zircon / cubic zirconia) necklace sets, bridal
          choker sets with maang tikka, earrings, bracelets and rings, priced
          between {formatPrice(minPrice)} and {formatPrice(maxPrice)}. Every
          piece shines like real diamond jewellery at a fraction of the price,
          in gold-, silver- and rose-tone finishes. We deliver nationwide in{' '}
          {STORE_CONFIG.deliveryDays} with cash on delivery, free delivery on
          orders above {freeOver}, and a 7-day exchange.
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
