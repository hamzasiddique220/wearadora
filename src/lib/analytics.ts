/**
 * Central analytics layer for Wear Adora.
 *
 * One place that fires conversion events to every connected platform
 * (Meta Pixel, TikTok Pixel, Google Analytics 4). Components call the
 * typed helpers below — they never touch `fbq` / `ttq` / `gtag` directly.
 *
 * Every helper is a no-op on the server and when a platform isn't loaded,
 * so it's always safe to call. Pixel IDs live in `.env.local`.
 */
import type { CartItem, Product } from '@/types';

type AnyFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: AnyFn;
    ttq?: { track: AnyFn; page: AnyFn } & Record<string, AnyFn>;
    gtag?: AnyFn;
    dataLayer?: unknown[];
  }
}

const CURRENCY = 'PKR';

export const ANALYTICS_IDS = {
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  // Falls back to the existing Firebase GA4 measurement id so analytics
  // works out of the box even before a dedicated web stream id is added.
  ga:
    process.env.NEXT_PUBLIC_GA_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

const meta = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
};

const tiktok = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.ttq?.track) {
    window.ttq.track(event, params);
  }
};

const ga = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
};

const toContentIds = (items: Pick<Product, 'id'>[]) => items.map((i) => i.id);

/** Fired when a product detail page is viewed. */
export const trackViewContent = (product: Product) => {
  meta('ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: CURRENCY,
  });
  tiktok('ViewContent', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: CURRENCY,
  });
  ga('view_item', {
    currency: CURRENCY,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
};

/** Fired when a product is added to the bag. */
export const trackAddToCart = (
  product: Product,
  quantity = 1,
  opts?: { size?: number; color?: string }
) => {
  const value = product.price * quantity;
  meta('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    contents: [{ id: product.id, quantity }],
    value,
    currency: CURRENCY,
  });
  tiktok('AddToCart', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    quantity,
    value,
    currency: CURRENCY,
  });
  ga('add_to_cart', {
    currency: CURRENCY,
    value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: [opts?.size ? `Size ${opts.size}` : null, opts?.color]
          .filter(Boolean)
          .join(' / '),
        price: product.price,
        quantity,
      },
    ],
  });
};

/** Fired when the customer opens checkout (Place Order). */
export const trackInitiateCheckout = (items: CartItem[], value: number) => {
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  meta('InitiateCheckout', {
    content_ids: toContentIds(items),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    content_type: 'product',
    num_items: numItems,
    value,
    currency: CURRENCY,
  });
  tiktok('InitiateCheckout', {
    contents: items.map((i) => ({
      content_id: i.id,
      content_name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    value,
    currency: CURRENCY,
  });
  ga('begin_checkout', {
    currency: CURRENCY,
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_category: i.category,
      price: i.price,
      quantity: i.quantity,
    })),
  });
};

/** Fired when an order is successfully placed. */
export const trackPurchase = (data: {
  orderId: string;
  items: CartItem[];
  value: number;
}) => {
  const { orderId, items, value } = data;
  meta('Purchase', {
    content_ids: toContentIds(items),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    content_type: 'product',
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: CURRENCY,
  });
  // Most Wear Adora sales are confirmed off-site (WhatsApp/COD), so the
  // browser-side order placement is also reported as a Lead for ad learning.
  meta('Lead', { value, currency: CURRENCY });
  tiktok('CompletePayment', {
    contents: items.map((i) => ({
      content_id: i.id,
      content_name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    value,
    currency: CURRENCY,
  });
  ga('purchase', {
    transaction_id: orderId,
    currency: CURRENCY,
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_category: i.category,
      price: i.price,
      quantity: i.quantity,
    })),
  });
};

/**
 * Fired when a visitor clicks a WhatsApp link to start a conversation —
 * lets Meta count the off-site lead intent (custom order / wholesale /
 * general support inquiries from the floating button, footer, etc.).
 */
export const trackContact = (source?: string) => {
  meta('Contact', source ? { source } : undefined);
  tiktok('Contact', source ? { source } : undefined);
};

/** Fired on client-side route changes so SPA navigations are counted. */
export const trackPageView = (url?: string) => {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  if (window.ttq?.page) window.ttq.page();
  if (typeof window.gtag === 'function' && ANALYTICS_IDS.ga) {
    window.gtag('event', 'page_view', {
      page_path: url ?? window.location.pathname,
      page_location: window.location.href,
    });
  }
};
