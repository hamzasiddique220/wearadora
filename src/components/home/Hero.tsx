'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';

interface Slide {
  image: string;
  bg: string;
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
      'https://wearadora.com/wp-content/uploads/2016/07/main-WA-1-black-card-img.png',
    bg: 'linear-gradient(135deg, #f5f1ea 0%, #e8ddc7 100%)',
    eyebrow: '✦ New Arrivals',
    title: 'Step into',
    italic: 'elegance',
    tail: 'redefined',
    description:
      'Discover our signature embellished slides — where contemporary design meets timeless sparkle. Crafted for the woman who makes every moment her own.',
    primary: { label: 'Shop Now', href: '/slippers' },
    secondary: { label: 'View All', href: '/shop' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-7.png',
    bg: 'linear-gradient(135deg, #e8ddc7 0%, #d4c9b8 100%)',
    eyebrow: '✦ Luxury Collection',
    title: 'Golden',
    italic: 'luxury',
    tail: 'for every stride',
    description:
      'Shimmering golden bow heels for unforgettable occasions. Every detail handcrafted to make you shine — perfect for weddings, festivities, and defining moments.',
    primary: { label: 'Shop Heels', href: '/slippers?category=Heels' },
    secondary: { label: 'Bestsellers', href: '/slippers' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-12.png',
    bg: 'linear-gradient(135deg, #f5f1ea 0%, #ede4d3 100%)',
    eyebrow: '✦ Signature Slides',
    title: 'Subtle',
    italic: 'grace',
    tail: 'in every detail',
    description:
      'Elegant nude bow slides — refined minimalism with a touch of glamour. Designed for comfort that never compromises on sophistication.',
    primary: { label: 'Shop Slides', href: '/slippers?category=Slides' },
    secondary: { label: 'View Jewelry', href: '/jewelry' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/03/remove.photos-removed-background-4.png',
    bg: 'linear-gradient(135deg, #efe6d5 0%, #d6c7b0 100%)',
    eyebrow: '✦ Statement Pieces',
    title: 'Dark',
    italic: 'romance',
    tail: 'for evenings',
    description:
      'Boldly refined black heels with sculpted silhouettes — the kind of shoes that finish a look and start a conversation.',
    primary: { label: 'Shop Heels', href: '/slippers?category=Heels' },
    secondary: { label: 'View All', href: '/slippers' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/03/remove.photos-removed-background-2.png',
    bg: 'linear-gradient(135deg, #f1e6d3 0%, #d8c6aa 100%)',
    eyebrow: '✦ Heritage Craft',
    title: 'Crafted',
    italic: 'in bronze',
    tail: 'tones',
    description:
      'Warm bronze-toned heels — a nod to artisan heritage, reimagined for the modern wardrobe. Made for women who love detail.',
    primary: { label: 'Shop Now', href: '/slippers' },
    secondary: { label: 'Shop Jewelry', href: '/jewelry' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-9.png',
    bg: 'linear-gradient(135deg, #f5ede0 0%, #e2d0b4 100%)',
    eyebrow: '✦ New Season',
    title: 'Walk in',
    italic: 'light',
    tail: 'and lustre',
    description:
      'Shimmering sandals for the season ahead — weightless comfort, unmistakable polish, and a finish that catches every eye.',
    primary: { label: 'Shop Sandals', href: '/slippers?category=Sandal' },
    secondary: { label: 'View All', href: '/shop' },
  },
  {
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-8-3.png',
    bg: 'linear-gradient(135deg, #ece2ce 0%, #d0bf9f 100%)',
    eyebrow: '✦ Editor\u2019s Pick',
    title: 'The perfect',
    italic: 'pair',
    tail: 'for every story',
    description:
      'Considered details, timeless silhouettes. Our editor-loved styles have a way of quietly finding their way into every outfit.',
    primary: { label: 'Shop Now', href: '/slippers' },
    secondary: { label: 'Discover', href: '/about' },
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const handleHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = imgWrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    img.style.transform = `perspective(1200px) rotateY(${px * 14}deg) rotateX(${-py * 10}deg) translateZ(30px) scale(1.12)`;
  };

  const handleHeroLeave = () => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transform = '';
  };

  const slide = slides[current];

  return (
    <section className="relative min-h-[92vh] md:min-h-screen overflow-hidden grain">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{ background: s.bg }}
        />
      ))}

      <div className="relative z-20 max-w-[1500px] mx-auto px-4 md:px-10 py-6 md:py-0 min-h-[92vh] md:min-h-screen grid md:grid-cols-[1fr_1.35fr] gap-4 md:gap-6 items-center">
        <div key={`text-${current}`} className="animate-in order-2 md:order-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-bronze" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-bronze font-medium">
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-light mb-6">
            {slide.title}{' '}
            <span className="font-italic-serif text-bronze">{slide.italic}</span>
            <br />
            {slide.tail}
          </h1>

          <p className="text-base md:text-lg text-mocha leading-relaxed mb-10 max-w-lg">
            {slide.description}
          </p>

          <div className="flex gap-4 flex-wrap">
            <Magnetic strength={0.3}>
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
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link href={slide.secondary.href} className="btn-outline">
                {slide.secondary.label}
              </Link>
            </Magnetic>
          </div>
        </div>

        <div
          ref={imgWrapRef}
          onMouseMove={handleHeroMove}
          onMouseLeave={handleHeroLeave}
          key={`img-${current}`}
          className="relative order-1 md:order-2 animate-in min-h-[60vh] md:min-h-[92vh] flex items-center justify-center"
          style={{ animationDelay: '0.15s', perspective: '1200px' }}
        >
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-50 float-3d"
            style={{
              background:
                'radial-gradient(circle at center, rgba(139,111,71,0.55) 0%, transparent 65%)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={slide.image}
            alt={slide.title}
            className="relative w-full h-full max-h-[75vh] md:max-h-[88vh] object-contain drop-shadow-2xl scale-110 md:scale-125 float-3d"
            style={{
              transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              willChange: 'transform',
              transformStyle: 'preserve-3d',
            }}
          />
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
