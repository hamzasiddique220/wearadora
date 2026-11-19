import { STORE_CONFIG, DELIVERY_TEXT } from '@/lib/constants';
import { buildFaqPageSchema } from '@/lib/schema';
import type { CategoryFaq } from '@/lib/categories';
import type { Product } from '@/types';

interface ProductFaqProps {
  product: Product;
  isJewelry: boolean;
}

/**
 * Per-product Q&A: visible accordion + matching FAQPage JSON-LD, built only
 * from facts the product data actually guarantees (site-wide policy, plus
 * product.material when an admin has confirmed it). Never invents set
 * contents, occasion fit, or styling claims the data can't back up.
 */
export default function ProductFaq({ product, isJewelry }: ProductFaqProps) {
  const faqs: CategoryFaq[] = [];

  if (isJewelry) {
    faqs.push({
      question: 'Is this real gold or artificial?',
      answer:
        'This is artificial (fashion) jewellery with a polished gold-, silver- or rose-tone finish over a base metal — not solid gold.',
    });
    if (product.material === 'Zircon') {
      faqs.push({
        question: 'Are the stones real diamonds?',
        answer:
          'No — this piece is set with zircon (American diamond) stones, chosen for their clarity and sparkle at a fraction of the cost of real diamonds.',
      });
    } else if (product.material === 'Crystal') {
      faqs.push({
        question: 'What are the stones made of?',
        answer:
          'This piece is set with crystal stones rather than natural gemstones or diamonds.',
      });
    }
    if (String(product.category) === 'Bridal') {
      faqs.push({
        question: 'Is this suitable for bridal wear?',
        answer: `Yes — ${product.name} is from our bridal jewellery collection, designed for weddings and bridal occasions.`,
      });
    }
  }

  faqs.push({
    question: 'What are the delivery charges and timeline?',
    answer: `Free delivery on orders over Rs ${STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')}; otherwise a flat Rs ${STORE_CONFIG.deliveryFee} charge applies. Estimated delivery is ${DELIVERY_TEXT.summary}, with cash on delivery available.`,
  });
  faqs.push({
    question: 'Can I return or exchange this item?',
    answer:
      'Yes — you can request a return or exchange within 7 days of delivery, provided the item is unused and in its original packaging. See our Return & Exchange Policy for full details.',
  });
  if (isJewelry) {
    faqs.push({
      question: 'How should I store and care for this piece?',
      answer:
        'Put it on last (after perfume and makeup) and remove it first. Keep it away from water, sweat and perfume, wipe with a soft dry cloth after wearing, and store it separately in an airtight pouch or box to slow tarnishing.',
    });
  }

  const faqSchema = buildFaqPageSchema(faqs);

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-light mb-5">
        Questions about this piece
      </h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details
            key={f.question}
            className="group border border-charcoal/10 rounded-md p-4 md:p-5 bg-cream/40 open:bg-cream/70 transition-colors"
          >
            <summary className="cursor-pointer list-none font-serif text-base md:text-lg text-charcoal flex items-start justify-between gap-4">
              <span>{f.question}</span>
              <span className="text-bronze text-xl leading-none shrink-0 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-mocha text-sm leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
