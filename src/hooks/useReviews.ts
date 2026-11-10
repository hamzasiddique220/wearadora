'use client';

import { useEffect, useState } from 'react';
import { reviewService } from '@/lib/services/reviews';
import { Review } from '@/types';

/** Realtime, admin-facing — every review across all products, any status. */
export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = reviewService.subscribeAll((items) => {
      setReviews(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { reviews, loading };
};

/** Realtime, storefront-facing — approved reviews for one product. */
export const useProductReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  /** true if the query failed (missing index, rules, network) — callers
   *  hide the reviews UI instead of spinning forever. Already logged. */
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    const unsubscribe = reviewService.subscribeForProduct(
      productId,
      (items) => {
        setReviews(items);
        setLoading(false);
      },
      () => {
        setReviews([]);
        setFailed(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId]);

  return { reviews, loading, failed };
};
