'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/lib/stores/data';
import type { Product, SiteSettings } from '@/types';

interface DataInitializerProps {
  initialProducts?: Product[];
  initialSettings?: SiteSettings | null;
  /** When false, no realtime onSnapshot subscriptions are opened. */
  realtime?: boolean;
}

/**
 * Mount once near the top of a route group to:
 *   1. Hydrate the data store from server-fetched values (instant first paint).
 *   2. Open ONE real-time onSnapshot subscription that all consumers share.
 */
export default function DataInitializer({
  initialProducts,
  initialSettings,
  realtime = true,
}: DataInitializerProps) {
  useEffect(() => {
    if (initialProducts || initialSettings !== undefined) {
      useDataStore
        .getState()
        .hydrate(initialProducts || [], initialSettings ?? null);
    }
    if (!realtime) return;
    useDataStore.getState().acquire();
    return () => {
      useDataStore.getState().release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
