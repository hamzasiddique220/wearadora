import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CategoryDef } from '@/lib/categories';

interface CategoryNavigationProps {
  /** Other category pages in this vertical to cross-link to. */
  others: CategoryDef[];
  /** Base path for each category link, e.g. '/jewelry' or '/shoes'. */
  basePath: string;
  /** Link back to the parent listing page, e.g. { href: '/jewelry', label: 'View All Jewellery' }. */
  viewAll: { href: string; label: string };
}

/** "Shop other categories" cross-links — internal linking between sibling /[vertical]/[category] pages. */
export default function CategoryNavigation({ others, basePath, viewAll }: CategoryNavigationProps) {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pb-16 md:pb-24">
      <div className="border-t border-stone pt-10 md:pt-14">
        <span className="text-[10px] tracking-[0.35em] uppercase text-bronze">
          ✦ Explore More
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mt-3 mb-6 md:mb-8">
          Related Categories
        </h2>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {others.map((d) => (
            <Link
              key={d.slug}
              href={`${basePath}/${d.slug}`}
              className="group border border-stone px-6 py-5 text-center hover:border-bronze transition-colors w-[45%] sm:w-40"
            >
              <div className="font-serif text-base md:text-lg text-charcoal group-hover:text-bronze transition-colors">
                {d.plural}
              </div>
              <div className="text-[9px] tracking-[0.25em] uppercase text-mocha mt-1">
                Shop Now
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href={viewAll.href}
            className="text-xs tracking-[0.2em] uppercase text-bronze hover:text-charcoal inline-flex items-center gap-2"
          >
            {viewAll.label} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
