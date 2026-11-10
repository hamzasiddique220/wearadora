import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, ReviewStatus } from '@/types';

const COLLECTION = 'reviews';

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

export const reviewService = {
  /**
   * Approved reviews for one product (public product page). Equality
   * filters only — no `orderBy` — so this never needs a Firestore
   * composite index. Sorted client-side instead.
   */
  subscribeForProduct: (
    productId: string,
    callback: (reviews: Review[]) => void
  ): Unsubscribe => {
    // status=='approved' is REQUIRED by the Firestore rules (rules are not
    // filters — an unfiltered query is rejected outright). Two equality
    // filters need no composite index.
    const q = query(
      collection(db, COLLECTION),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    );
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Review)
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      callback(items);
    });
  },

  /** All reviews across all products — admin management view. */
  subscribeAll: (callback: (reviews: Review[]) => void): Unsubscribe => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Review
      );
      callback(items);
    });
  },

  create: async (data: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(
      collection(db, COLLECTION),
      stripUndefined({
        ...data,
        createdAt: new Date().toISOString(),
      })
    );
    return docRef.id;
  },

  update: async (id: string, data: Partial<Review>): Promise<void> => {
    await updateDoc(
      doc(db, COLLECTION, id),
      stripUndefined({ ...data, updatedAt: new Date().toISOString() })
    );
  },

  updateStatus: async (id: string, status: ReviewStatus): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
