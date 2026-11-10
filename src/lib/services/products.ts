import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

const COLLECTION = 'products';

/** Strip undefined values — Firestore's addDoc/updateDoc reject them. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as unknown as T;
  }
  return value;
}

export const productService = {
  /**
   * Every internal link prefers `slug` over the Firestore id (see
   * productHandle() in lib/utils.ts), so two products sharing a slug would
   * make one of them unreachable at its own URL. Suffix with -2, -3, ... until
   * the candidate is free among every other product (excludeId lets an
   * existing product keep matching itself while editing).
   */
  ensureUniqueSlug: async (baseSlug: string, excludeId?: string): Promise<string> => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const snapshot = await getDocs(
        query(collection(db, COLLECTION), where('slug', '==', candidate))
      );
      const collides = snapshot.docs.some((d) => d.id !== excludeId);
      if (!collides) return candidate;
    }
    return `${baseSlug}-${Date.now().toString().slice(-6)}`;
  },

  subscribe: (callback: (products: Product[]) => void): Unsubscribe => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Product
      );
      callback(items);
    });
  },

  create: async (data: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(
      collection(db, COLLECTION),
      stripUndefined({
        ...data,
        createdAt: new Date().toISOString(),
      })
    );
    return docRef.id;
  },

  update: async (id: string, data: Partial<Product>): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), stripUndefined(data));
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Live catalog prices for the given product ids (null = product deleted).
   * Checkout calls this right before writing an order, because the
   * Firestore rules reject any order whose item prices don't match the
   * current catalog — and cart items are price snapshots from add-to-cart.
   */
  getCurrentPrices: async (ids: string[]): Promise<Record<string, number | null>> => {
    const unique = Array.from(new Set(ids));
    const snaps = await Promise.all(unique.map((id) => getDoc(doc(db, COLLECTION, id))));
    const out: Record<string, number | null> = {};
    snaps.forEach((s, i) => {
      const price = s.exists() ? Number(s.data().price) : NaN;
      out[unique[i]] = Number.isFinite(price) ? price : null;
    });
    return out;
  },

  /** Admin-only signed upload (see services/cloudinaryUpload.ts). */
  uploadImage: async (file: File): Promise<string> => {
    const { uploadAdminImage } = await import('./cloudinaryUpload');
    return uploadAdminImage(file, 'products');
  },

  deleteImage: async (_imageUrl: string): Promise<void> => {
    // Cloudinary deletion requires signed server call; orphans cleanable via dashboard.
  },
};
