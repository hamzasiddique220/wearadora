'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useAuthStore } from '@/lib/stores/auth';

export default function StorageHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
