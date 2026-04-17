'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const safeImages = images.length > 0 ? images : ['/placeholder.png'];
  const current = safeImages[active] ?? safeImages[0];

  useEffect(() => {
    setActive(0);
  }, [images]);

  useEffect(() => {
    if (!zoomOpen) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowRight')
        setActive((a) => (a + 1) % safeImages.length);
      if (e.key === 'ArrowLeft')
        setActive((a) => (a - 1 + safeImages.length) % safeImages.length);
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [zoomOpen, safeImages.length]);

  const isTransparent =
    /wearadora\.com/.test(current) || /\.png(\?|$)/i.test(current);

  const next = () => setActive((a) => (a + 1) % safeImages.length);
  const prev = () =>
    setActive((a) => (a - 1 + safeImages.length) % safeImages.length);

  return (
    <>
      <div className="flex gap-4 flex-col-reverse md:flex-row">
        {safeImages.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[640px] scrollbar-hide md:w-20 shrink-0">
            {safeImages.map((img, i) => {
              const thumbTransparent =
                /wearadora\.com/.test(img) || /\.png(\?|$)/i.test(img);
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative shrink-0 w-20 h-20 overflow-hidden border-2 transition-all bg-gradient-to-br from-sand/60 via-cream to-sand/30 ${
                    active === i
                      ? 'border-bronze shadow-sm'
                      : 'border-transparent hover:border-stone'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${alt} ${i + 1}`}
                    className={`w-full h-full ${
                      thumbTransparent ? 'object-contain p-1' : 'object-cover'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="relative flex-1">
          <div className="relative aspect-square md:aspect-[4/5] bg-gradient-to-br from-sand/70 via-cream to-sand/40 overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current}
              src={current}
              alt={alt}
              className={`w-full h-full transition-transform duration-500 ${
                isTransparent ? 'object-contain p-6 md:p-10' : 'object-cover'
              }`}
            />

            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom image"
              className="absolute top-4 right-4 w-10 h-10 bg-white/95 flex items-center justify-center shadow-sm hover:bg-bronze hover:text-white transition"
            >
              <ZoomIn size={16} />
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/85 backdrop-blur px-3 py-1.5">
                  {safeImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`transition-all h-[3px] ${
                        i === active
                          ? 'w-7 bg-charcoal'
                          : 'w-4 bg-charcoal/30 hover:bg-charcoal/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {zoomOpen && (
        <div className="fixed inset-0 z-[60] bg-charcoal/95 flex items-center justify-center p-4 md:p-8 animate-in">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={20} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={alt}
            className="max-w-full max-h-full object-contain"
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-[0.3em] uppercase">
            {active + 1} / {safeImages.length}
          </div>
        </div>
      )}
    </>
  );
}
