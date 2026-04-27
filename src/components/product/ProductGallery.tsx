'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Expand } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const safeImages = useMemo(
    () => (images.length > 0 ? images : ['/placeholder.png']),
    [images]
  );
  const current = safeImages[active] ?? safeImages[0];

  useEffect(() => {
    setActive(0);
  }, [images]);

  useEffect(() => {
    if (!zoomOpen) return;
    document.body.style.overflow = 'hidden';
    setLightboxScale(1);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === '+' || e.key === '=')
        setLightboxScale((s) => Math.min(3, s + 0.25));
      if (e.key === '-' || e.key === '_')
        setLightboxScale((s) => Math.max(1, s - 0.25));
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomOpen, safeImages.length]);

  const next = () => setActive((a) => (a + 1) % safeImages.length);
  const prev = () =>
    setActive((a) => (a - 1 + safeImages.length) % safeImages.length);

  const handleStageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y });
  };

  const handleStageLeave = () => setLens(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <div className="flex gap-4 flex-col-reverse md:flex-row">
        {safeImages.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[640px] scrollbar-hide md:w-[92px] shrink-0">
            {safeImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative shrink-0 w-[72px] h-[72px] md:w-[92px] md:h-[110px] overflow-hidden border transition-all bg-cream [&_img]:[mix-blend-mode:darken] ${
                  active === i
                    ? 'border-bronze shadow-md'
                    : 'border-stone/60 hover:border-charcoal/60 opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-contain p-1.5"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-1">
          <div
            ref={stageRef}
            onMouseMove={handleStageMove}
            onMouseLeave={handleStageLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="relative aspect-square md:aspect-[4/5] overflow-hidden group bg-cream border border-stone/60 cursor-zoom-in [&>img]:[mix-blend-mode:darken]"
            onClick={() => setZoomOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current}
              src={current}
              alt={alt}
              className={`w-full h-full object-contain p-6 md:p-10 transition-transform duration-500 ${
                lens ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Hover zoom panel (desktop only) */}
            {lens && (
              <div
                className="absolute inset-0 hidden md:block pointer-events-none"
                style={{
                  backgroundImage: `url(${current})`,
                  backgroundSize: '220%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: `${lens.x}% ${lens.y}%`,
                  backgroundColor: '#fff',
                }}
              />
            )}

            {/* Lens indicator */}
            {lens && (
              <div
                className="absolute hidden md:block pointer-events-none border border-bronze/70 shadow-xl"
                style={{
                  width: 120,
                  height: 120,
                  left: `calc(${lens.x}% - 60px)`,
                  top: `calc(${lens.y}% - 60px)`,
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(0.5px)',
                }}
              />
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(true);
              }}
              aria-label="Open fullscreen"
              className="absolute top-4 right-4 w-10 h-10 bg-white/95 flex items-center justify-center shadow-sm hover:bg-bronze hover:text-white transition z-10"
            >
              <Expand size={16} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase bg-white/85 backdrop-blur px-3 py-1.5 text-charcoal/70 hidden md:flex items-center gap-2 z-10">
              <ZoomIn size={12} /> Hover to zoom · Click to enlarge
            </div>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {safeImages.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {safeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`transition-all h-[3px] ${
                    i === active
                      ? 'w-8 bg-bronze'
                      : 'w-4 bg-charcoal/25 hover:bg-charcoal/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {zoomOpen && (
        <div className="fixed inset-0 z-[60] bg-charcoal/95 flex items-center justify-center p-4 md:p-8 animate-in">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
          >
            <X size={20} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setLightboxScale((s) => Math.max(1, s - 0.25))}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="text-white/80 text-xs tracking-[0.2em] w-12 text-center">
              {Math.round(lightboxScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setLightboxScale((s) => Math.min(3, s + 0.25))}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <div
            className="relative max-w-full max-h-full overflow-auto"
            style={{ cursor: lightboxScale > 1 ? 'move' : 'default' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-300"
              style={{
                transform: `scale(${lightboxScale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-[0.3em] uppercase">
            {active + 1} / {safeImages.length}
          </div>

          {safeImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto scrollbar-hide">
              {safeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`shrink-0 w-14 h-14 overflow-hidden border-2 bg-white/5 ${
                    active === i
                      ? 'border-bronze'
                      : 'border-white/20 hover:border-white/60'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${alt} ${i + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
