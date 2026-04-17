'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => boolean; // Returns true if added, false if removed
  isWishlisted: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.find((item) => item.id === product.id);
        if (exists) {
          set({ items: get().items.filter((item) => item.id !== product.id) });
          return false;
        }
        set({ items: [...get().items, product] });
        return true;
      },

      isWishlisted: (id) => get().items.some((item) => item.id === id),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'wearadora-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
