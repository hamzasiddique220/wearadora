'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { productService } from '@/lib/services/products';
import { siteSettingsService } from '@/lib/services/siteSettings';
import { mergeSettings } from '@/lib/defaults/siteSettings';
import { getProductType } from '@/lib/constants';
import type { Product, SiteSettings } from '@/types';

type MergedSettings = ReturnType<typeof mergeSettings>;

interface DataState {
  products: Product[];
  settingsRaw: SiteSettings | null;
  productsLoaded: boolean;
  settingsLoaded: boolean;
  hydratedFromServer: boolean;
  _refCount: number;
  _unsubProducts?: () => void;
  _unsubSettings?: () => void;
  hydrate: (products: Product[], settings: SiteSettings | null) => void;
  acquire: () => void;
  release: () => void;
}

/* ----------------------------------------------------- module-level caches
 *
 * These memoize expensive derivations by INPUT IDENTITY so consumers always
 * get back the same reference for the same input. This matters because zustand
 * v5 calls selectors inside React's useSyncExternalStore — if the selector
 * returns a fresh object every call, React thinks the snapshot is unstable
 * and re-renders forever ("getServerSnapshot should be cached").
 */

let mergedCache: { raw: SiteSettings | null; merged: MergedSettings } | null =
  null;

function getMergedSettings(raw: SiteSettings | null): MergedSettings {
  if (mergedCache && mergedCache.raw === raw) return mergedCache.merged;
  const merged = mergeSettings(raw);
  mergedCache = { raw, merged };
  return merged;
}

let visibleCache:
  | { products: Product[]; jewelryEnabled: boolean; visible: Product[] }
  | null = null;

function getVisibleProducts(
  products: Product[],
  jewelryEnabled: boolean
): Product[] {
  if (
    visibleCache &&
    visibleCache.products === products &&
    visibleCache.jewelryEnabled === jewelryEnabled
  ) {
    return visibleCache.visible;
  }
  const visible = jewelryEnabled
    ? products
    : products.filter(
        (p) =>
          (p.productType || getProductType(p.category as string)) !== 'jewelry'
      );
  visibleCache = { products, jewelryEnabled, visible };
  return visible;
}

/**
 * Single source of truth for the product catalog and site settings.
 *
 * Pattern:
 *   - Server pages call `fetchAllProducts` / `fetchSiteSettings` and pass the
 *     result through <DataInitializer/> which calls `hydrate(...)`.
 *   - Client components mount via the legacy `useProducts` / `useSiteSettings`
 *     hooks (or call `acquire` directly) which ref-count the onSnapshot
 *     subscriptions so we keep ONE listener per collection regardless of how
 *     many components consume the data.
 */
export const useDataStore = create<DataState>((set, get) => ({
  products: [],
  settingsRaw: null,
  productsLoaded: false,
  settingsLoaded: false,
  hydratedFromServer: false,
  _refCount: 0,

  hydrate: (products, settingsRaw) => {
    if (get().hydratedFromServer) return;
    set({
      products,
      settingsRaw,
      productsLoaded: true,
      settingsLoaded: true,
      hydratedFromServer: true,
    });
  },

  acquire: () => {
    const next = get()._refCount + 1;
    if (next === 1 && !get()._unsubProducts) {
      const unsubProducts = productService.subscribe((products) =>
        set({ products, productsLoaded: true })
      );
      const unsubSettings = siteSettingsService.subscribe((settingsRaw) =>
        set({ settingsRaw, settingsLoaded: true })
      );
      set({
        _unsubProducts: unsubProducts,
        _unsubSettings: unsubSettings,
        _refCount: next,
      });
      return;
    }
    set({ _refCount: next });
  },

  release: () => {
    const next = Math.max(0, get()._refCount - 1);
    if (next === 0) {
      get()._unsubProducts?.();
      get()._unsubSettings?.();
      set({
        _unsubProducts: undefined,
        _unsubSettings: undefined,
        _refCount: 0,
      });
      return;
    }
    set({ _refCount: next });
  },
}));

/* -------------------------------------------------------------- selectors
 *
 * Each selector reads ONE field from the store. They return a stable
 * reference (or primitive) so React's useSyncExternalStore is happy. Derived
 * shapes are assembled with `useMemo` in the wrapper hooks below.
 */

const selectProducts = (s: DataState) => s.products;
const selectProductsLoaded = (s: DataState) => s.productsLoaded;
const selectSettingsRaw = (s: DataState) => s.settingsRaw;
const selectSettingsLoaded = (s: DataState) => s.settingsLoaded;

interface SettingsSlice {
  settings: MergedSettings;
  raw: SiteSettings | null;
  loading: boolean;
}

interface ProductsSlice {
  products: Product[];
  loading: boolean;
}

export const useSiteSettingsData = (): SettingsSlice => {
  const raw = useDataStore(selectSettingsRaw);
  const loaded = useDataStore(selectSettingsLoaded);
  const settings = useMemo(() => getMergedSettings(raw), [raw]);
  return useMemo(
    () => ({ settings, raw, loading: !loaded }),
    [settings, raw, loaded]
  );
};

export const useProductsData = (): ProductsSlice => {
  const products = useDataStore(selectProducts);
  const loaded = useDataStore(selectProductsLoaded);
  return useMemo(
    () => ({ products, loading: !loaded }),
    [products, loaded]
  );
};

/**
 * Returns products filtered by the jewelry-enabled flag.
 * Replacement for the old useVisibleProducts hook.
 */
export const useVisibleProductsData = () => {
  const { products, loading: productsLoading } = useProductsData();
  const { settings, loading: settingsLoading } = useSiteSettingsData();

  const jewelryEnabled = settings.jewelryEnabled;

  const visible = useMemo(
    () => getVisibleProducts(products, jewelryEnabled),
    [products, jewelryEnabled]
  );

  return useMemo(
    () => ({
      products: visible,
      loading: productsLoading || settingsLoading,
      jewelryEnabled,
    }),
    [visible, productsLoading, settingsLoading, jewelryEnabled]
  );
};
