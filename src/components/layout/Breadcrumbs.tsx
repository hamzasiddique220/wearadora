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
        className={`text-[11px] sm:text-xs tracking-[0.2em] uppercase text-charcoal/60 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => {
            const isLast = i === all.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {c.href && !isLast ? (
                  <Link
                    href={c.href}
                    className="hover:text-bronze transition-colors"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'text-charcoal' : ''}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {c.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight size={12} className="text-charcoal/30" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
