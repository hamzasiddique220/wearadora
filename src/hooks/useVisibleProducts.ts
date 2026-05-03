'use client';

import { useMemo } from 'react';
import { useProducts } from './useProducts';
import { useSiteSettings } from './useSiteSettings';
import { getProductType } from '@/lib/constants';

/**
 * Same as useProducts, but filters out jewelry items when the admin has the
 * jewelry section disabled. Use this everywhere the storefront lists products.
 * (Admin views and the cart should keep using useProducts directly.)
 */
export const useVisibleProducts = () => {
  const { products, loading, error } = useProducts();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const visible = useMemo(() => {
    if (settings.jewelryEnabled) return products;
    return products.filter(
      (p) =>
        (p.productType || getProductType(p.category as string)) !== 'jewelry'
    );
  }, [products, settings.jewelryEnabled]);

  return {
    products: visible,
    loading: loading || settingsLoading,
    error,
    jewelryEnabled: settings.jewelryEnabled,
  };
};
