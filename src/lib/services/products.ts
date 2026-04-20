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
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/types';

const COLLECTION = 'products';

export const productService = {
  /**
   * Subscribe to all products with real-time updates
   */
  subscribe: (callback: (products: Product[]) => void): Unsubscribe => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Product
      );
      callback(items);
    });
  },

  /**
   * Create a new product
   */
  create: async (data: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  /**
   * Update existing product
   */
  update: async (id: string, data: Partial<Product>): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  /**
   * Delete product
   */
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Upload product image to Firebase Storage
   */
  uploadImage: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `products/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, file, { contentType: file.type });
    return getDownloadURL(ref);
  },

  /**
   * Delete an uploaded image by its download URL
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      const match = imageUrl.match(/\/o\/([^?]+)/);
      if (!match) return;
      const path = decodeURIComponent(match[1]);
      await deleteObject(storageRef(storage, path));
    } catch {
      // Silent: orphaned files can be cleaned from the Firebase console.
    }
  },
};
