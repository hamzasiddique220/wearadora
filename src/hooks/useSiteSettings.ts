'use client';

import { useEffect } from 'react';
import { useDataStore, useSiteSettingsData } from '@/lib/stores/data';

/**
 * Backwards-compatible wrapper. Returns settings from the shared store and
 * keeps the realtime subscription alive while consumers are mounted.
 */
export const useSiteSettings = () => {
  useEffect(() => {
    useDataStore.getState().acquire();
    return () => {
      useDataStore.getState().release();
    };
  }, []);

  const { settings, raw, loading } = useSiteSettingsData();
  return { settings, raw, loading };
};
