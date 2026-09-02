import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
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

  uploadImage: async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      throw new Error('Cloudinary env vars missing');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Cloudinary upload failed: ${err}`);
    }
    const data = await res.json();
    const url = data.secure_url as string;
    // Inject f_auto,q_auto so Cloudinary serves AVIF/WebP at the right quality
    // even when the URL is rendered through a raw <img> (e.g. admin previews).
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/f_auto,q_auto/')
      : url;
  },

  deleteImage: async (_imageUrl: string): Promise<void> => {
    // Cloudinary deletion requires signed server call; orphans cleanable via dashboard.
  },
};
