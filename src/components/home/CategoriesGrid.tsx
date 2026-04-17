import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_IMAGES } from '@/lib/constants';

export default function CategoriesGrid() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Explore
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light mt-2">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs tracking-[0.2em] uppercase hover:text-bronze flex items-center gap-2"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(CATEGORY_IMAGES).map(([cat, img]) => (
          <Link
            key={cat}
            href={`/shop?category=${cat}`}
            className="group relative aspect-[3/4] overflow-hidden hover-lift"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={cat}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="font-serif text-lg">{cat}</div>
              <div className="text-[9px] tracking-[0.3em] uppercase opacity-70">
                Shop Now →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
