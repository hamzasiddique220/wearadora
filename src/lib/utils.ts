/**
 * Format number as Pakistani Rupee
 */
export const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString('en-PK')}`;
};

/**
 * Format date in Pakistani locale
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate unique order ID
 */
export const generateOrderId = (): string => {
  return 'WA-' + Date.now().toString().slice(-8);
};

/**
 * Class name merger utility
 */
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Safe localStorage wrapper
 */
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage error:', e);
    }
  },
};

/**
 * Clean phone number for WhatsApp link
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Convert a free-form string (e.g. product name) into a URL-safe slug.
 * Lower-cased, ASCII alphanumerics + dashes, max 80 chars.
 */
export const sluggify = (input: string): string => {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
};

/**
 * Return the SEO-friendly handle for a product URL — slug if available,
 * else the Firestore document id.
 */
export const productHandle = (product: { slug?: string; id: string }): string =>
  product.slug && product.slug.trim() ? product.slug : product.id;
