'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function StorySection() {
  const { settings } = useSiteSettings();
  return (
    <section className="bg-charcoal text-cream py-14 md:py-20 px-4 sm:px-6 md:px-12 relative overflow-hidden grain">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative">
        <div>
          <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
            ✦ Our Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2 mb-4 md:mb-6 leading-tight">
            Crafted with{' '}
            <span className="font-italic-serif text-bronze">passion</span>, worn with
            pride
          </h2>
          <p className="text-stone leading-relaxed mb-5 md:mb-6 text-[13px] sm:text-sm md:text-base">
            Every piece at WEARADORA is born from the hands of skilled artisans who
            pour their soul into every detail. From delicate jewelry that whispers
            stories of heritage to handcrafted footwear that embraces every step, we
            celebrate the beauty of artistry.
          </p>
          <Link
            href="/about"
            className="inline-block border border-stone px-5 md:px-6 py-3 text-[11px] md:text-xs tracking-[0.18em] md:tracking-[0.2em] uppercase hover:bg-bronze hover:border-bronze transition-colors"
          >
            Learn More
          </Link>
        </div>

        <div className="relative aspect-[4/3] sm:aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.storyImage}
            alt="Artisan craftsmanship"
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-bronze p-6 text-center hidden md:block">
            <div className="font-serif text-5xl">10+</div>
            <div className="text-xs tracking-[0.2em] uppercase mt-1">
              Years of craft
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
