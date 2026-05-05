'use client';

import { useEffect } from 'react';
import { useDataStore, useProductsData } from '@/lib/stores/data';

/**
 * Backwards-compatible wrapper. Returns products from the shared store and
 * ensures a real-time subscription exists for the lifetime of the consumer.
 */
export const useProducts = () => {
  useEffect(() => {
    useDataStore.getState().acquire();
    return () => {
      useDataStore.getState().release();
    };
  }, []);

  const { products, loading } = useProductsData();
  return { products, loading, error: null as string | null };
};
