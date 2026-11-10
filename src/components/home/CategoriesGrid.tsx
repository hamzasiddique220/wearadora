'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { useSiteSettingsData } from '@/lib/stores/data';

interface CategoryTile {
  name: string;
  href: string;
  kind: 'shoe' | 'jewel';
}

const CATEGORY_TILES: CategoryTile[] = [
  { name: 'Slides', href: '/slippers/slides', kind: 'shoe' },
  { name: 'Heels', href: '/slippers/heels', kind: 'shoe' },
  { name: 'Sandal', href: '/slippers/sandals', kind: 'shoe' },
  { name: 'Necklace', href: '/jewelry/necklace', kind: 'jewel' },
  { name: 'Ring', href: '/jewelry/rings', kind: 'jewel' },
  { name: 'Earring', href: '/jewelry/earrings', kind: 'jewel' },
  { name: 'Bangles', href: '/jewelry/bangles', kind: 'jewel' },
];

export default function CategoriesGrid() {
  const { settings } = useSiteSettingsData();
  const tiles = settings.jewelryEnabled
    ? CATEGORY_TILES
    : CATEGORY_TILES.filter((t) => t.kind !== 'jewel');

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-3 md:gap-4">
          <div>
            <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
              ✦ Explore
            </span>
            <h2 id="categories" className="scroll-mt-28 font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[11px] md:text-xs tracking-[0.18em] md:tracking-[0.2em] uppercase hover:text-bronze flex items-center gap-2"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 perspective-1000">
        {tiles.map((cat, i) => {
          const image = settings.categoryImages[cat.name] || '';
          const isProductImage =
            image.startsWith('/images/') || image.includes('cloudinary');
          const displayName = cat.name === 'Sandal' ? 'Sandals' : cat.name;
          return (
            <Reveal key={cat.name} delay={i * 70}>
              <Link
                href={cat.href}
                className={`tilt-card group relative block aspect-[3/4] overflow-hidden rounded-sm transition-all duration-500 ${
                  isProductImage
                    ? 'product-surface-light shadow-sm hover:shadow-2xl hover:shadow-bronze/30'
                    : 'bg-gradient-to-br from-sand/70 via-cream to-sand/40 shadow-sm hover:shadow-2xl hover:shadow-bronze/25'
                }`}
              >
                {image && (
                  <Image
                    src={image}
                    alt={displayName}
                    fill
                    sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 50vw"
                    className={
                      isProductImage
                        ? 'cat-product-img z-10 object-contain drop-shadow-[0_18px_24px_rgba(26,22,20,0.25)]'
                        : 'object-cover transition-transform duration-700 group-hover:scale-110'
                    }
                  />
                )}
                <div
                  className={`absolute inset-0 ${
                    isProductImage
                      ? 'bg-gradient-to-t from-charcoal/70 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent'
                  }`}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shine-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 translate-z-10">
                  <div className="font-serif text-lg">{displayName}</div>
                  <div className="text-[9px] tracking-[0.3em] uppercase opacity-80">
                    Shop Now →
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
