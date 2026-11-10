'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { ORDER_LIMITS } from '@/lib/constants';

const clampQty = (q: number) => Math.min(ORDER_LIMITS.maxQtyPerLine, q);

export const makeCartLineId = (
  productId: string,
  size?: number,
  color?: string
): string => {
  const parts = [productId];
  if (size !== undefined) parts.push(`s${size}`);
  if (color) parts.push(`c${color}`);
  return parts.join('-');
};

interface AddOptions {
  selectedSize?: number;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, options?: AddOptions) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, delta: number) => void;
  clearCart: () => void;
  /** Re-price lines from live catalog prices; drop lines whose product is
   *  gone. Returns true if anything changed. */
  syncPrices: (prices: Record<string, number | null>) => boolean;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options = {}) => {
        const cartLineId = makeCartLineId(
          product.id,
          options.selectedSize,
          options.selectedColor
        );
        const existing = get().items.find((item) => item.cartLineId === cartLineId);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.cartLineId === cartLineId
                ? { ...item, quantity: clampQty(item.quantity + 1) }
                : item
            ),
          });
        } else {
          const colorImage =
            options.selectedColor && product.colorImages
              ? product.colorImages[options.selectedColor]
              : undefined;
          set({
            items: [
              ...get().items,
              {
                ...product,
                image: colorImage || product.image,
                quantity: 1,
                selectedSize: options.selectedSize,
                selectedColor: options.selectedColor,
                cartLineId,
              },
            ],
          });
        }
      },

      removeItem: (cartLineId) => {
        set({ items: get().items.filter((item) => item.cartLineId !== cartLineId) });
      },

      updateQuantity: (cartLineId, delta) => {
        set({
          items: get()
            .items.map((item) => {
              if (item.cartLineId === cartLineId) {
                const newQty = clampQty(item.quantity + delta);
                return newQty > 0 ? { ...item, quantity: newQty } : item;
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        });
      },

      clearCart: () => set({ items: [] }),

      syncPrices: (prices) => {
        let changed = false;
        const items = get()
          .items.filter((item) => {
            const keep = prices[item.id] !== null && prices[item.id] !== undefined;
            if (!keep) changed = true;
            return keep;
          })
          .map((item) => {
            const live = prices[item.id] as number;
            if (live === item.price) return item;
            changed = true;
            return { ...item, price: live };
          });
        if (changed) set({ items });
        return changed;
      },

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'wearadora-cart-v2',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
