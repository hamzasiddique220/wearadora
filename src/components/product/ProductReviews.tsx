'use client';

import { useMemo, useState } from 'react';
import { Star, PenSquare } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import ReviewCard from '@/components/product/ReviewCard';
import ReviewForm from '@/components/product/ReviewForm';
import type { Review } from '@/types';

const PAGE_SIZE = 6;

export default function ProductReviews({
  productId,
  productName,
  reviews,
  loading,
}: {
  productId: string;
  productName: string;
  reviews: Review[];
  loading: boolean;
}) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const approved = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  const stats = useMemo(() => {
    const count = approved.length;
    const average = count
      ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const starCount = approved.filter((r) => r.rating === star).length;
      return {
        star,
        count: starCount,
        percent: count ? Math.round((starCount / count) * 100) : 0,
      };
    });
    return { count, average, distribution };
  }, [approved]);

  const sorted = useMemo(
    () =>
      [...approved].sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [approved]
  );

  const visible = sorted.slice(0, visibleCount);

  return (
    <section id="reviews" className="mt-16 md:mt-24 scroll-mt-24">
      <div className="flex items-end justify-between mb-6 md:mb-8 flex-wrap gap-3 md:gap-4">
        <div>
          <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
            ✦ Customer Reviews
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mt-2">
            What Our Customers Say
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setWriteOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PenSquare size={14} /> Write a Review
        </button>
      </div>

      {loading ? (
        <Loading message="Loading reviews..." />
      ) : (
        <>
          {stats.count > 0 && (
            <div className="bg-white border border-stone p-5 md:p-8 mb-8 grid md:grid-cols-[auto_1fr] gap-6 md:gap-12">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:border-r md:border-stone md:pr-12">
                <div className="font-serif text-4xl md:text-5xl leading-none">
                  {stats.average.toFixed(1)}
                </div>
                <div>
                  <StarRating value={Math.round(stats.average)} size={16} />
                  <div className="text-[11px] text-mocha mt-1.5 whitespace-nowrap">
                    Based on {stats.count} review{stats.count === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                {stats.distribution.map((row) => (
                  <div key={row.star} className="flex items-center gap-3">
                    <span className="text-xs text-mocha w-9 shrink-0">
                      {row.star} ★
                    </span>
                    <div className="flex-1 h-2 bg-sand overflow-hidden">
                      <div
                        className="h-full bg-bronze transition-all duration-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-mocha w-16 shrink-0 text-right">
                      {row.percent}% ({row.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.count === 0 ? (
            <EmptyState
              icon={Star}
              message="No reviews yet — be the first to share your experience."
            />
          ) : (
            <>
              <div className="space-y-4">
                {visible.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {visibleCount < sorted.length && (
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="btn-outline"
                  >
                    Show More Reviews
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ReviewForm
        productId={productId}
        productName={productName}
        isOpen={writeOpen}
        onClose={() => setWriteOpen(false)}
      />
    </section>
  );
}
