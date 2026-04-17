'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden grain">
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="bg-sand" />
        <div className="relative overflow-hidden hide-mobile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200"
            alt="Jewelry collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/10" />
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-20 w-full">
        <div className="max-w-2xl animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-bronze" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-bronze font-medium">
              ✦ Spring Collection 2026
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-light mb-6">
            Where <span className="font-italic-serif text-bronze">elegance</span>
            <br />
            meets the art of
            <br />
            <span className="font-italic-serif">adornment</span>
          </h1>

          <p className="text-base md:text-lg text-mocha leading-relaxed mb-10 max-w-lg">
            Discover handcrafted jewelry and artisan footwear, each piece telling a
            story of tradition woven with modern elegance.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link href="/shop" className="btn-primary group flex items-center gap-3">
              Explore Collection{' '}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link href="/shop" className="btn-outline">
              View Jewelry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
