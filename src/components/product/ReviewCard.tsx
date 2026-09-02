'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, BadgeCheck, Sparkles } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';
import { avatarColor } from '@/lib/avatarColor';
import type { Review } from '@/types';

export default function ReviewCard({ review }: { review: Review }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = review.images || [];
  const initial = review.reviewerName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-white border border-stone p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-serif text-lg shrink-0"
            style={{ backgroundColor: avatarColor(review.reviewerName) }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-charcoal text-sm md:text-base">
                {review.reviewerName}
              </span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase text-[#2d6a4f] bg-[#2d6a4f]/10 px-1.5 py-0.5">
                  <BadgeCheck size={11} /> Verified
                </span>
              )}
              {review.featured && (
                <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase text-bronze bg-bronze/10 px-1.5 py-0.5">
                  <Sparkles size={11} /> Featured
                </span>
              )}
            </div>
            <div className="text-[11px] text-mocha mt-0.5">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        <StarRating value={review.rating} size={14} />
      </div>

      <p className="text-[13px] md:text-sm text-charcoal leading-relaxed whitespace-pre-line mb-4">
        {review.comment}
      </p>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden border border-stone shrink-0 hover:opacity-80 transition-opacity"
            >
              <Image src={url} alt={`Review photo ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i! - 1 + images.length) % images.length);
                }}
                className="absolute left-2 md:left-6 text-white/80 hover:text-white z-10 p-2"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i! + 1) % images.length);
                }}
                className="absolute right-2 md:right-6 text-white/80 hover:text-white z-10 p-2"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-3xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`Review photo ${lightboxIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
