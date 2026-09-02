'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Quote } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { avatarColor } from '@/lib/avatarColor';
import { formatDate } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';

const MAX_CARDS = 6;

export default function Testimonials() {
  const { reviews, loading } = useReviews();

  const approved = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  const stats = useMemo(() => {
    const count = approved.length;
    const average = count
      ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    return { count, average };
  }, [approved]);

  const featured = useMemo(() => {
    // Featured (admin-curated) first, then the rest — all sorted newest
    // first within each group, and only the ones with real substance (a
    // short one-word review doesn't make a good pull-quote on the homepage).
    const withSubstance = approved.filter((r) => r.comment.trim().length >= 20);
    const sorted = [...withSubstance].sort((a, b) => {
      if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, MAX_CARDS);
  }, [approved]);

  // Nothing worth showing yet — stay invisible rather than showing an empty
  // "no reviews" homepage section (that prompt belongs on the product page,
  // where there's a clear next action).
  if (loading || featured.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-14 md:py-20">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
          ✦ Customer Reviews
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2 mb-4 md:mb-5 leading-tight">
          Loved by Customers Across Pakistan
        </h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-serif text-3xl md:text-4xl leading-none">
            {stats.average.toFixed(1)}
          </span>
          <StarRating value={Math.round(stats.average)} size={18} />
          <span className="text-sm text-mocha">
            from {stats.count} review{stats.count === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {featured.map((review) => (
          <Link
            key={review.id}
            href={`/product/${review.productId}#reviews`}
            className="bg-white border border-stone p-5 md:p-6 flex flex-col hover:border-bronze transition-colors group"
          >
            <Quote size={22} className="text-bronze/40 mb-3" fill="currentColor" />
            <StarRating value={review.rating} size={13} className="mb-3" />
            <p className="text-[13px] md:text-sm text-charcoal leading-relaxed mb-4 line-clamp-4">
              {review.comment}
            </p>
            <div className="mt-auto flex items-center gap-3 pt-3 border-t border-stone">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif text-sm shrink-0"
                style={{ backgroundColor: avatarColor(review.reviewerName) }}
                aria-hidden="true"
              >
                {review.reviewerName.trim().charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-charcoal truncate">
                  {review.reviewerName}
                </div>
                <div className="text-[10px] text-mocha truncate">
                  {formatDate(review.createdAt)}
                  {review.productName ? ` • On ${review.productName}` : ''}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
