import Image from 'next/image';
import type { CategoryDef } from '@/lib/categories';

interface CategoryBannerProps {
  def: CategoryDef;
  image: string;
}

/** Static editorial banner for a /jewelry/[category] page — server-rendered, no client JS. */
export default function CategoryBanner({ def, image }: CategoryBannerProps) {
  return (
    <section className="relative h-[30vh] sm:h-[36vh] md:h-[42vh] overflow-hidden grain">
      <Image
        src={image}
        alt={def.h1}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/30 to-cream" />
      <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze mb-2 md:mb-3">
          ✦ The Jewellery Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-light text-white drop-shadow">
          {def.h1}
        </h1>
        <p className="text-white/90 mt-3 md:mt-4 max-w-xl text-[13px] sm:text-sm md:text-base px-2">
          {def.intro}
        </p>
      </div>
    </section>
  );
}
