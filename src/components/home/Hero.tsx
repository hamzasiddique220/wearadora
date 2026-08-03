'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisibleProductsData, useSiteSettingsData } from '@/lib/stores/data';
import { getProductType } from '@/lib/constants';
import { jewelryCategoryHref } from '@/lib/categories';
import { slippersCategoryHref } from '@/lib/footwearCategories';
import { productHandle } from '@/lib/utils';
import {
  JEWELRY_BG,
  SHOE_BG_LIGHT,
  SHOE_BG_WARM,
} from '@/lib/defaults/siteSettings';
import { Product, HeroSlideOverride } from '@/types';

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
  kind: 'shoe' | 'jewel';
}

function overrideToSlide(o: HeroSlideOverride): Slide {
  return {
    image: o.image,
    bg:
      o.bg ||
      (o.kind === 'jewel' ? JEWELRY_BG : SHOE_BG_LIGHT),
    eyebrow: o.eyebrow,
    title: o.title,
    italic: o.italic,
    tail: o.tail || '',
    description: o.description,
    primary: { label: o.primaryLabel, href: o.primaryHref },
    secondary: { label: o.secondaryLabel, href: o.secondaryHref },
    kind: o.kind,
  };
}

function buildSlideFromProduct(p: Product, img: string): Slide {
  const productType =
    p.productType || getProductType(p.category as string);
  const isJewel = productType === 'jewelry';
  const isShoeIndex = !isJewel;
  const href = `/product/${productHandle(p)}`;
  const categoryHref = isJewel
    ? jewelryCategoryHref(p.category as string)
    : slippersCategoryHref(p.category as string);

  const words = p.name.split(' ');
  const italic = words.length > 1 ? words[words.length - 1] : '';
  const title = words.length > 1 ? words.slice(0, -1).join(' ') : p.name;

  return {
    image: img,
    bg: isJewel
      ? JEWELRY_BG
      : isShoeIndex && p.category === 'Heels'
        ? SHOE_BG_WARM
        : SHOE_BG_LIGHT,
    eyebrow: `✦ ${p.category}`,
    title,
    italic: italic || p.category,
    tail: '',
    description: p.description || `Explore our ${p.category.toString().toLowerCase()} collection — handcrafted for moments that matter.`,
    primary: { label: 'Shop Now', href },
    secondary: { label: 'View Category', href: categoryHref },
    kind: isJewel ? 'jewel' : 'shoe',
  };
}

export default function Hero() {
  const { products } = useVisibleProductsData();
  const { settings } = useSiteSettingsData();
  const jewelryEnabled = settings.jewelryEnabled === true;
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const rafRef = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  const fallbackSlides = useMemo<Slide[]>(
    () =>
      settings.heroSlides
        .filter((s) => jewelryEnabled || s.kind !== 'jewel')
        .map(overrideToSlide),
    [settings.heroSlides, jewelryEnabled]
  );

  const slides = useMemo<Slide[]>(() => {
    const productSlides: Slide[] = [];
    for (const p of products) {
      const slideImgs = (p.slideImages || []).filter(Boolean);
      for (const img of slideImgs) {
        productSlides.push(buildSlideFromProduct(p, img));
      }
    }
    if (productSlides.length === 0) return fallbackSlides;
    if (productSlides.length < 2) {
      return [...productSlides, ...fallbackSlides];
    }
    return productSlides;
  }, [products, fallbackSlides]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  useEffect(() => {
    if (isDragging) return;
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5200);
    return () => clearInterval(timer);
  }, [next, isDragging, slides.length]);

  const applyTransform = () => {
    const el = imgRef.current;
    if (!el) return;
    const { rx, ry, tx, ty } = tiltRef.current;
    el.style.transform = `perspective(1300px) rotateY(${ry}deg) rotateX(${rx}deg) translate3d(${tx}px, ${ty}px, 40px) scale(1.08)`;
  };

  const handleHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const wrap = imgWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.ry = px * 22;
    tiltRef.current.rx = -py * 16;
    tiltRef.current.tx = px * 14;
    tiltRef.current.ty = py * 10;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  };

  const handleHeroLeave = () => {
    const el = imgRef.current;
    if (!el) return;
    tiltRef.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
    el.style.transform = '';
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rx: tiltRef.current.rx,
      ry: tiltRef.current.ry,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    tiltRef.current.ry = Math.max(-45, Math.min(45, dragStart.current.ry + dx * 0.35));
    tiltRef.current.rx = Math.max(-25, Math.min(25, dragStart.current.rx - dy * 0.25));
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  };
  const onPointerUp = () => {
    setIsDragging(false);
  };

  const slide = slides[current] ?? slides[0];
  const isDarkSlide = slide.kind === 'jewel' && slide.bg.includes('#1a1614');

  return (
    <section className="relative min-h-[78vh] sm:min-h-[85vh] md:min-h-screen overflow-hidden grain">
      {slides.map((s, i) => {
        const isActive = i === current;
        const isNext = slides.length > 1 && i === (current + 1) % slides.length;
        if (!isActive && !isNext) return null;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ background: s.bg }}
          />
        );
      })}

      <div className="relative z-20 max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 pt-4 pb-12 md:py-0 min-h-[78vh] sm:min-h-[85vh] md:min-h-screen grid md:grid-cols-[1fr_1.35fr] gap-3 md:gap-6 items-center">
        <div
          key={`text-${current}`}
          className={`animate-in order-2 md:order-1 ${
            isDarkSlide ? 'text-cream' : ''
          }`}
        >
          <div className="flex items-center gap-3 mb-3 md:mb-6">
            <div className="h-px w-8 md:w-12 bg-bronze" />
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze font-medium">
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="font-serif text-[32px] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] font-light mb-3 md:mb-6">
            {slide.title}{' '}
            <span className="font-italic-serif text-bronze">{slide.italic}</span>
            {slide.tail && (
              <>
                <br />
                {slide.tail}
              </>
            )}
          </h1>

          <p
            className={`text-[13px] sm:text-base md:text-lg leading-relaxed mb-5 md:mb-10 max-w-lg line-clamp-3 md:line-clamp-4 ${
              isDarkSlide ? 'text-stone/90' : 'text-mocha'
            }`}
          >
            {slide.description}
          </p>

          <div className="flex gap-2.5 md:gap-4 flex-wrap">
            <Link
              href={slide.primary.href}
              className={`hero-cta group inline-flex items-center gap-3 ${
                isDarkSlide ? 'hero-cta--on-dark' : ''
              }`}
            >
              {slide.primary.label}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href={slide.secondary.href}
              className={`hero-cta hero-cta--outline ${
                isDarkSlide ? 'hero-cta--outline-on-dark' : ''
              }`}
            >
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div
          ref={imgWrapRef}
          onMouseMove={handleHeroMove}
          onMouseLeave={handleHeroLeave}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          key={`img-${current}`}
          className="hero-stage relative order-1 md:order-2 animate-in min-h-[38vh] sm:min-h-[48vh] md:min-h-[92vh] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-pan-y"
          style={{ animationDelay: '0.15s', perspective: '1300px' }}
        >
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-60 float-3d"
            style={{
              background:
                slide.kind === 'jewel'
                  ? 'radial-gradient(circle at center, rgba(212,175,55,0.45) 0%, transparent 65%)'
                  : 'radial-gradient(circle at center, rgba(139,111,71,0.55) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[55%] h-10 rounded-full blur-2xl opacity-40"
            style={{ background: 'rgba(26,22,20,0.55)' }}
          />
          <div className="hero-auto-rotate w-full h-full flex items-center justify-center">
            <div
              ref={imgRef}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                transition: isDragging
                  ? 'none'
                  : 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
                willChange: 'transform',
                transformStyle: 'preserve-3d',
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                width={1200}
                height={1200}
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 60vw, 100vw"
                draggable={false}
                className={`hero-img w-auto h-auto max-h-[38vh] sm:max-h-[48vh] md:max-h-[88vh] scale-[1] md:scale-125 float-3d ${
                  slide.kind === 'jewel'
                    ? 'object-cover rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.45)] max-w-[90%] md:max-w-[85%]'
                    : 'object-contain drop-shadow-[0_30px_60px_rgba(26,22,20,0.35)]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
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

          <div className="absolute bottom-5 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all h-[3px] ${
                  i === current
                    ? `w-8 md:w-10 ${isDarkSlide ? 'bg-cream' : 'bg-charcoal'}`
                    : `w-5 md:w-6 ${
                        isDarkSlide
                          ? 'bg-cream/30 hover:bg-cream/60'
                          : 'bg-charcoal/30 hover:bg-charcoal/60'
                      }`
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
