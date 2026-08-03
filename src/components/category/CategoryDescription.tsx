import type { CategoryDef } from '@/lib/categories';

interface CategoryDescriptionProps {
  def: CategoryDef;
}

/** Long-form SEO/GEO content block for a /[vertical]/[category] page. */
export default function CategoryDescription({ def }: CategoryDescriptionProps) {
  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 border-t border-stone">
      <span className="text-[10px] tracking-[0.35em] uppercase text-bronze">
        ✦ About the Collection
      </span>
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mt-3 mb-6">
        {def.plural} Online in Pakistan
      </h2>
      <div className="space-y-4">
        {def.description.map((paragraph, i) => (
          <p key={i} className="text-mocha leading-relaxed text-sm md:text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
