import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface HeroCta {
  label: string;
  href: string;
}

interface CategoryHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  /** The image area (one <Image fill priority> or a slideshow + controls). */
  media: React.ReactNode;
  /** 'photo' = editorial crop; 'product' = cut-out PNG on a soft cream panel. */
  kind?: 'photo' | 'product';
  /** One real primary action. Omitted on sub-category pages, where the grid follows directly. */
  cta?: HeroCta;
}

/**
 * Split category hero shared by /jewelry, /shoes and their sub-category pages.
 *
 * Text always sits on the solid cream panel, never on the photo, so contrast
 * holds for ANY hero image an admin uploads in Settings (charcoal 16:1,
 * mocha 7.2:1, label bronze-ink 5.3:1 on cream — all WCAG AA). Desktop height
 * is clamp(300px, 42vh, 480px) (a min-height, so copy can never spill over
 * the grid) and is set server-side, so nothing shifts while the image loads;
 * the first product row stays above the fold at 1366×768.
 *
 * No trust-badge row: the announcement bar directly above already states
 * the same facts (exchange, delivery time, COD).
 *
 * Presentational only (no hooks), so it renders on the server for the static
 * sub-category banner and inside the client CategoryPage alike.
 */
export default function CategoryHero({
  eyebrow,
  title,
  description,
  media,
  kind = 'photo',
  cta,
}: CategoryHeroProps) {
  return (
    <section className="border-b border-stone/70 bg-cream">
      <div className="max-w-[1400px] mx-auto md:grid md:grid-cols-12 md:min-h-[clamp(300px,42vh,480px)]">
        {/* Media — first on mobile (short band), right column on desktop */}
        <div
          className={`relative h-[150px] sm:h-[220px] md:h-auto md:order-2 md:col-span-6 lg:col-span-7 overflow-hidden ${
            kind === 'product'
              ? 'bg-[radial-gradient(ellipse_at_center,#efe7da_0%,#e8ddc7_55%,#ddd0b9_100%)]'
              : 'bg-sand'
          }`}
        >
          {media}
        </div>

        {/* Copy — always on solid cream */}
        <div className="md:order-1 md:col-span-6 lg:col-span-5 flex flex-col justify-center px-4 sm:px-6 md:pl-8 lg:pl-12 md:pr-8 lg:pr-10 py-5 md:py-7">
          <span className="text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-bronze-ink mb-2 md:mb-3">
            {eyebrow}
          </span>
          <h1 className="font-serif text-[28px] leading-[1.08] sm:text-[34px] lg:text-[42px] xl:text-[50px] font-light text-charcoal text-balance">
            {title}
          </h1>
          <p className="text-mocha mt-2.5 md:mt-3 text-[14px] md:text-[15px] leading-relaxed max-w-[34rem] text-pretty">
            {description}
          </p>

          {cta && (
            <div className="mt-4 md:mt-5">
              <Link href={cta.href} className="hero-cta group inline-flex items-center gap-3 !py-3 !px-6">
                {cta.label}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
