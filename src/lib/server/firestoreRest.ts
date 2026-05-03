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

/** Fetch a single product by id from Firestore via the public REST API. */
export async function fetchProduct(id: string): Promise<Product | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const doc = (await res.json()) as FirestoreDocument;
    if (!doc.fields) return null;
    return fromDocument<Product>(doc);
  } catch (err) {
    console.error('fetchProduct error:', err);
    return null;
  }
}

/** Fetch the singleton site settings doc (used in server components / sitemap / metadata). */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/siteSettings/main`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const doc = (await res.json()) as FirestoreDocument;
    if (!doc.fields) return null;
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
    const res = await fetch(`${BASE}/products?pageSize=300`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { documents?: FirestoreDocument[] };
    return (data.documents || []).map((d) => fromDocument<Product>(d));
  } catch (err) {
    console.error('fetchAllProducts error:', err);
    return [];
  }
}
