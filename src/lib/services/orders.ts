import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';

const COLLECTION = 'orders';

/**
 * Recursively strip `undefined` values from an object/array before sending
 * to Firestore — addDoc rejects undefined and crashes the checkout. Common
 * source: jewelry products lack `sizes`/`colors`/`selectedSize`/etc., and
 * optional customer fields like `notes`/`mapLink`.
 */
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

export const orderService = {
  /**
   * Subscribe to all orders with real-time updates
   */
  subscribe: (callback: (orders: Order[]) => void): Unsubscribe => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Order
      );
      callback(items);
    });
  },

  /**
   * Create a new order
   */
  create: async (data: Omit<Order, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION), stripUndefined(data));
    return docRef.id;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, status: OrderStatus): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), { status });
  },

  /**
   * Delete an order
   */
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
