'use client';

import { useEffect } from 'react';
import { useDataStore, useVisibleProductsData } from '@/lib/stores/data';

/**
 * Same as useProducts, but filters out jewellery items when the admin has the
 * jewellery section disabled. Use this everywhere the storefront lists products.
 * (Admin views and the cart should keep using useProducts directly.)
 */
export const useVisibleProducts = () => {
  useEffect(() => {
    useDataStore.getState().acquire();
    return () => {
      useDataStore.getState().release();
    };
  }, []);

  const { products, loading, jewelryEnabled } = useVisibleProductsData();
  return {
    products,
    loading,
    error: null as string | null,
    jewelryEnabled,
  };
};
