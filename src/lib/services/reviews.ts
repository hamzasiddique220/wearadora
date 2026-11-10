import {
  collection,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  setDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, ReviewStatus } from '@/types';

const COLLECTION = 'reviews';
/** Admin-only: reviewer emails, keyed by review id. Never on the public doc,
 *  because approved reviews are world-readable. */
const PRIVATE = 'reviewPrivate';

function splitEmail<T extends { reviewerEmail?: string }>(data: T) {
  const { reviewerEmail, ...rest } = data;
  return { email: reviewerEmail?.trim() || '', hasEmailKey: 'reviewerEmail' in data, rest };
}

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
    callback: (reviews: Review[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    // status=='approved' is REQUIRED by the Firestore rules (rules are not
    // filters — an unfiltered query is rejected outright). Two equality
    // filters need no composite index.
    const q = query(
      collection(db, COLLECTION),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Review)
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        callback(items);
      },
      (error) => {
        // e.g. failed-precondition (missing composite index) or
        // permission-denied. Firestore's message includes the index link.
        console.error(`[reviews] product ${productId} query failed:`, error.code || '', error.message);
        onError?.(error);
      }
    );
  },

  /** All reviews across all products — admin management view. */
  subscribeAll: (callback: (reviews: Review[]) => void): Unsubscribe => {
    // Joins reviewPrivate (emails) onto each review for the admin view.
    let reviews: Review[] = [];
    let emails: Record<string, string> = {};
    let gotReviews = false;
    const emit = () =>
      gotReviews &&
      callback(reviews.map((r) => (emails[r.id] ? { ...r, reviewerEmail: emails[r.id] } : r)));

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const unsubReviews = onSnapshot(q, (snapshot) => {
      reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
      gotReviews = true;
      emit();
    });
    const unsubPrivate = onSnapshot(collection(db, PRIVATE), (snapshot) => {
      emails = Object.fromEntries(
        snapshot.docs.map((d) => [d.id, String(d.data().reviewerEmail || '')])
      );
      emit();
    });
    return () => {
      unsubReviews();
      unsubPrivate();
    };
  },

  /**
   * Public review doc + (optional) private email doc in ONE batch — the
   * rules only let a customer create reviewPrivate/{id} in the same write
   * that creates the pending review.
   */
  create: async (data: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
    const { email, rest } = splitEmail(data);
    const createdAt = new Date().toISOString();
    const reviewRef = doc(collection(db, COLLECTION));
    const batch = writeBatch(db);
    batch.set(reviewRef, stripUndefined({ ...rest, createdAt }));
    if (email) {
      batch.set(doc(db, PRIVATE, reviewRef.id), { reviewerEmail: email, createdAt });
    }
    await batch.commit();
    return reviewRef.id;
  },

  /** Admin only. Passing reviewerEmail ('' clears it) updates reviewPrivate. */
  update: async (id: string, data: Partial<Review>): Promise<void> => {
    const { email, hasEmailKey, rest } = splitEmail(data);
    await updateDoc(
      doc(db, COLLECTION, id),
      {
        ...stripUndefined({ ...rest, updatedAt: new Date().toISOString() }),
        // Scrub any email left on the public doc by older code. Added after
        // stripUndefined, which would flatten the sentinel into a plain object.
        reviewerEmail: deleteField(),
      }
    );
    if (hasEmailKey) {
      if (email) await setDoc(doc(db, PRIVATE, id), { reviewerEmail: email }, { merge: true });
      else await deleteDoc(doc(db, PRIVATE, id));
    }
  },

  updateStatus: async (id: string, status: ReviewStatus): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  delete: async (id: string): Promise<void> => {
    const batch = writeBatch(db);
    batch.delete(doc(db, COLLECTION, id));
    batch.delete(doc(db, PRIVATE, id));
    await batch.commit();
  },
};
