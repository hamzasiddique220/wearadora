import { STORE_CONFIG } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { buildFaqPageSchema } from '@/lib/schema';
import type { CategoryDef, CategoryFaq } from '@/lib/categories';
import type { Product } from '@/types';

interface CategoryFAQProps {
  def: CategoryDef;
  products: Product[];
}

/**
 * Visible FAQ accordion + matching FAQPage JSON-LD for a /[vertical]/[category]
 * page. The price-range question is computed from the actual filtered
 * products so it never drifts from real catalog pricing, and is inserted
 * right after the category's own static FAQs.
 */
export default function CategoryFAQ({ def, products }: CategoryFAQProps) {
  const prices = products.map((p) => p.price).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 449;
  const maxPrice = prices.length ? Math.max(...prices) : 2499;

  const priceFaq: CategoryFaq = {
    question: `What is the price range for ${def.plural.toLowerCase()} at Wear Adora?`,
    answer: `${def.plural} at Wear Adora range from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}, handcrafted in gold-, silver- and rose-tone finishes and shipped nationwide across Pakistan with cash on delivery.`,
  };

  const faqs = [def.faqs[0], priceFaq, ...def.faqs.slice(1)];
  const faqSchema = buildFaqPageSchema(faqs);

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details
            key={f.question}
            className="group border border-charcoal/10 rounded-md p-5 md:p-6 bg-cream/40 open:bg-cream/70 transition-colors"
          >
            <summary className="cursor-pointer list-none font-serif text-lg md:text-xl text-charcoal flex items-start justify-between gap-4">
              <span>{f.question}</span>
              <span className="text-bronze text-2xl leading-none shrink-0 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-mocha text-sm md:text-base leading-relaxed">
              {f.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 md:mt-14 text-center">
        <p className="text-mocha text-sm mb-4">Question still not answered?</p>
        <a
          href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-[0.25em] uppercase border border-charcoal text-charcoal px-6 py-3 hover:bg-charcoal hover:text-cream transition-colors inline-block"
        >
          WhatsApp Us
        </a>
      </div>
    </section>
  );
}
