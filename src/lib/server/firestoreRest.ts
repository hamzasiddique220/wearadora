import 'server-only';
import type { Product, SiteSettings } from '@/types';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE = PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  : null;

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

function parseValue(v: FirestoreValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue) {
    return (v.arrayValue.values || []).map(parseValue);
  }
  if (v.mapValue) {
    const obj: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) {
      obj[k] = parseValue(val);
    }
    return obj;
  }
  return undefined;
}

function fromDocument<T>(doc: FirestoreDocument): T {
  const result: Record<string, unknown> = {};
  const id = doc.name.split('/').pop();
  if (id) result.id = id;
  for (const [k, v] of Object.entries(doc.fields || {})) {
    result[k] = parseValue(v);
  }
  return result as T;
}

/**
 * fetch + JSON with a hard timeout and small retry budget. Firestore is a
 * remote service; on flaky networks (e.g. happy-eyeballs IPv6 hangs) a bare
 * fetch can stall for tens of seconds before failing. This wrapper aborts
 * each attempt at `timeoutMs` and retries up to `attempts` times before
 * giving up, so the caller sees a quick failure rather than a long hang.
 *
 * Returns parsed JSON on 2xx, `null` on non-ok HTTP, and throws on
 * exhausted network failure (callers should catch and degrade gracefully).
 */
async function fetchJson<T>(
  url: string,
  init: RequestInit & { next?: { revalidate?: number } } = {},
  attempts = 3,
  timeoutMs = 6000
): Promise<T | null> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

/** Fetch a single product by id from Firestore via the public REST API. */
export async function fetchProduct(id: string): Promise<Product | null> {
  if (!BASE) return null;
  try {
    const doc = await fetchJson<FirestoreDocument>(
      `${BASE}/products/${encodeURIComponent(id)}`,
      { next: { revalidate: 300 } }
    );
    if (!doc?.fields) return null;
    return fromDocument<Product>(doc);
  } catch (err) {
    console.error('fetchProduct error:', err);
    return null;
  }
}

/**
 * Look up a product whose `slug` field equals the given value using a
 * Firestore structured query — direct, indexed, and not cached so a freshly
 * saved product is found immediately.
 */
async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!BASE) return null;
  try {
    const rows = await fetchJson<Array<{ document?: FirestoreDocument }>>(
      `${BASE}:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'products' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'slug' },
                op: 'EQUAL',
                value: { stringValue: slug },
              },
            },
            limit: 1,
          },
        }),
      }
    );
    const doc = rows?.find((r) => r.document)?.document;
    if (!doc?.fields) return null;
    return fromDocument<Product>(doc);
  } catch (err) {
    console.error('fetchProductBySlug error:', err);
    return null;
  }
}

/**
 * Look up a product by a URL handle that may be either a Firestore document
 * id (legacy URLs) or a slug (new SEO-friendly URLs). Returns the product
 * along with the matching mode so callers can issue a 301 from an id-based
 * URL to the canonical slug-based one.
 */
export async function fetchProductByHandle(
  handle: string
): Promise<{ product: Product; matchedBy: 'id' | 'slug' } | null> {
  const byId = await fetchProduct(handle);
  if (byId) return { product: byId, matchedBy: 'id' };

  const bySlug = await fetchProductBySlug(handle);
  if (bySlug) return { product: bySlug, matchedBy: 'slug' };

  return null;
}

/** Fetch the singleton site settings doc (used in server components / sitemap / metadata). */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  if (!BASE) return null;
  try {
    const doc = await fetchJson<FirestoreDocument>(
      `${BASE}/siteSettings/main`,
      { next: { revalidate: 60 } }
    );
    if (!doc?.fields) return null;
    return fromDocument<SiteSettings>(doc);
  } catch (err) {
    console.error('fetchSiteSettings error:', err);
    return null;
  }
}

/** Fetch all products (page size 300 — fine for a small catalog). Used by sitemap. */
export async function fetchAllProducts(): Promise<Product[]> {
  if (!BASE) return [];
  try {
    const data = await fetchJson<{ documents?: FirestoreDocument[] }>(
      `${BASE}/products?pageSize=300`,
      { next: { revalidate: 600 } }
    );
    return (data?.documents || []).map((d) => fromDocument<Product>(d));
  } catch (err) {
    console.error('fetchAllProducts error:', err);
    return [];
  }
}
