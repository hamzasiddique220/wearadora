import Image from 'next/image';
import type { CategoryDef } from '@/lib/categories';
import CategoryHero from './CategoryHero';

interface CategoryBannerProps {
  def: CategoryDef;
  image: string;
  eyebrow: string;
}

/**
 * Hero for a /jewelry/[category] or /shoes/[category] page — the same split
 * layout as the collection pages (text on cream, image beside it), rendered
 * on the server with no client JS. No CTA: the product grid follows directly.
 */
export default function CategoryBanner({ def, image, eyebrow }: CategoryBannerProps) {
  return (
    <CategoryHero
      eyebrow={eyebrow}
      title={def.h1}
      description={def.intro}
      media={
        <Image
          src={image}
          alt={def.h1}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-center"
        />
      }
    />
  );
}
