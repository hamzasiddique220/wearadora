import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items.length) return null;

  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${STORE_CONFIG.siteUrl}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`text-[11px] sm:text-xs text-charcoal/60 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
          {all.map((c, i) => {
            const isLast = i === all.length - 1;
            // One consistent style (the design system's uppercase tracked
            // label) for every crumb; the current page is just darker. CSS
            // uppercases it, so the text — and the BreadcrumbList schema name
            // above — stays in normal case ("Jewellery").
            const base = 'tracking-[0.2em] uppercase';
            const styling = isLast
              ? `${base} text-charcoal max-w-full break-words`
              : `${base} hover:text-bronze transition-colors`;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
                {c.href && !isLast ? (
                  <Link href={c.href} className={styling}>
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={styling}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {c.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight size={12} className="text-charcoal/30 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
