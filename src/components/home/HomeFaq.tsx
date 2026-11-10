import Link from 'next/link';
import { getHomeFaqs } from '@/lib/homeFaq';
import { buildFaqPageSchema } from '@/lib/schema';
import type { SizeRange } from '@/lib/sizeRange';

interface HomeFaqProps {
  jewelryEnabled: boolean;
  sizeRange: SizeRange | null;
}

/**
 * Home page FAQ. The visible Q&As and the FAQPage JSON-LD are rendered from
 * the same array (getHomeFaqs), so the markup always matches the page text.
 */
export default function HomeFaq({ jewelryEnabled, sizeRange }: HomeFaqProps) {
  const faqs = getHomeFaqs(jewelryEnabled, sizeRange);
  if (faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="faq"
      className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 py-14 md:py-20"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqPageSchema(faqs)) }}
      />
      <div className="text-center mb-8 md:mb-12">
        <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
          ✦ Good to Know
        </span>
        <h2
          id="faq"
          className="scroll-mt-28 font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2 leading-tight"
        >
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-6 md:space-y-8">
        {faqs.map((f) => (
          <div key={f.id} className="border-b border-charcoal/10 pb-6 md:pb-8 last:border-0">
            <h3
              id={f.id}
              className="scroll-mt-28 font-serif text-lg md:text-xl text-charcoal mb-2"
            >
              {f.question}
            </h3>
            <p className="text-mocha text-sm md:text-base leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-mocha text-sm mt-8 md:mt-10">
        More answers on our{' '}
        <Link href="/faq" className="text-bronze underline underline-offset-4">
          FAQ page
        </Link>{' '}
        and{' '}
        <Link href="/shipping" className="text-bronze underline underline-offset-4">
          shipping details
        </Link>
        .
      </p>
    </section>
  );
}
