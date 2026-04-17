'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  italic: string;
  tail: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

const slides: Slide[] = [
  {
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=85',
    eyebrow: '✦ Spring Collection 2026',
    title: 'Where',
    italic: 'elegance',
    tail: 'meets artistry',
    description:
      'Discover handcrafted jewelry and artisan footwear — each piece telling a story of tradition woven with modern elegance.',
    primary: { label: 'Explore Collection', href: '/shop' },
    secondary: { label: 'View Jewelry', href: '/jewelry' },
  },
  {
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1800&q=85',
    eyebrow: '✦ Signature Jewelry',
    title: 'Timeless',
    italic: 'luxury',
    tail: 'for every moment',
    description:
      'From delicate necklaces to statement rings, our jewelry is crafted for those who cherish refined sophistication.',
    primary: { label: 'Shop Jewelry', href: '/jewelry' },
    secondary: { label: 'Bestsellers', href: '/shop' },
  },
  {
    image:
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1800&q=85',
    eyebrow: '✦ Artisan Footwear',
    title: 'Step into',
    italic: 'grace',
    tail: 'with every stride',
    description:
      'Handcrafted khussas and sandals that blend traditional artistry with contemporary comfort.',
    primary: { label: 'Shop Slippers', href: '/slippers' },
    secondary: { label: 'See Sizes', href: '/slippers' },
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[90vh] md:min-h-screen overflow-hidden grain"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/70 md:via-cream/50 to-cream/10" />
        </div>
      ))}

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-32 flex items-center min-h-[90vh] md:min-h-screen">
        <div key={current} className="max-w-2xl animate-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-bronze" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-bronze font-medium">
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-light mb-6">
            {slide.title}{' '}
            <span className="font-italic-serif text-bronze">{slide.italic}</span>
            <br />
            {slide.tail}
          </h1>

          <p className="text-base md:text-lg text-mocha leading-relaxed mb-10 max-w-lg">
            {slide.description}
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              href={slide.primary.href}
              className="btn-primary group flex items-center gap-3"
            >
              {slide.primary.label}{' '}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link href={slide.secondary.href} className="btn-outline">
              {slide.secondary.label}
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur items-center justify-center shadow transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur items-center justify-center shadow transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all h-[3px] ${
              i === current
                ? 'w-10 bg-charcoal'
                : 'w-6 bg-charcoal/30 hover:bg-charcoal/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
