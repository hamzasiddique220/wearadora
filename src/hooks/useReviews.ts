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

/** Realtime, storefront-facing — every review for one product, any status
 *  (callers filter to `status === 'approved'` before rendering). */
export const useProductReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = reviewService.subscribeForProduct(productId, (items) => {
      setReviews(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  return { reviews, loading };
};
