import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { JEWELRY_CATEGORY_DEFS } from '@/lib/categories';

export default function CategoryNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
      <div className="w-16 h-16 bg-bronze/10 text-bronze rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles size={26} />
      </div>
      <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
        ✦ Not Found
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
        This collection{' '}
        <span className="font-italic-serif text-bronze">doesn&rsquo;t exist</span>
      </h1>
      <p className="text-mocha leading-relaxed mb-8 text-sm md:text-base">
        The jewellery category you&rsquo;re looking for may have moved or
        never existed. Try one of these instead.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {JEWELRY_CATEGORY_DEFS.map((d) => (
          <Link
            key={d.slug}
            href={`/jewelry/${d.slug}`}
            className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-stone hover:border-charcoal transition-colors"
          >
            {d.plural}
          </Link>
        ))}
      </div>
      <Link href="/jewelry" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft size={14} /> View All Jewellery
      </Link>
    </div>
  );
}
