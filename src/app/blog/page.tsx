import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';
import { listBlogPosts } from '@/lib/blog';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Style Journal',
  description:
    'Style guides, jewellery care tips and buying advice from WEARADORA — handcrafted in Karachi, made for every Pakistani occasion.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `Style Journal | ${STORE_CONFIG.name}`,
    description:
      'Style guides, jewellery care tips and buying advice from WEARADORA.',
    url: `${STORE_CONFIG.siteUrl}/blog`,
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Journal' }]} />
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ The Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
            Style notes &amp;{' '}
            <span className="font-italic-serif text-bronze">jewellery care</span>
          </h1>
          <p className="text-mocha leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            Simple guides to help you pick the right set, style it for every
            event, and keep it looking beautiful for years.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block border border-charcoal/10 hover:border-bronze/40 rounded-lg p-6 md:p-8 transition-colors bg-cream/30"
            >
              <h2 className="font-serif text-xl md:text-2xl font-light mb-3 group-hover:text-bronze transition-colors">
                {p.title.replace(/\s*\|.*$/, '')}
              </h2>
              <p className="text-mocha text-sm leading-relaxed mb-5">
                {p.excerpt}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.25em] uppercase text-bronze">
                Read article <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
