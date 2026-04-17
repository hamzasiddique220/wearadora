import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Slides',
    image:
      'https://wearadora.com/wp-content/uploads/2016/07/main-WA-1-black-card-img.png',
    href: '/slippers?category=Slides',
  },
  {
    name: 'Heels',
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-7.png',
    href: '/slippers?category=Heels',
  },
  {
    name: 'Sandals',
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-9.png',
    href: '/slippers?category=Sandal',
  },
  {
    name: 'Necklace',
    image:
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800',
    href: '/jewelry?category=Necklace',
  },
  {
    name: 'Ring',
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    href: '/jewelry?category=Ring',
  },
  {
    name: 'Earring',
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    href: '/jewelry?category=Earring',
  },
  {
    name: 'Bracelet',
    image:
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
    href: '/jewelry?category=Bracelet',
  },
];

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {categories.map((cat) => {
          const isProductImage = cat.image.includes('wearadora.com');
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-[3/4] overflow-hidden hover-lift rounded-sm bg-gradient-to-br from-sand/70 via-cream to-sand/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className={`w-full h-full ${
                  isProductImage
                    ? 'object-contain p-2 group-hover:scale-105'
                    : 'object-cover group-hover:scale-110'
                } transition-transform duration-700`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="font-serif text-lg">{cat.name}</div>
                <div className="text-[9px] tracking-[0.3em] uppercase opacity-70">
                  Shop Now →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
