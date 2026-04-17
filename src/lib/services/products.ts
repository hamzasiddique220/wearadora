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
   * Upload product image to Cloudinary (unsigned)
   */
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
    return data.secure_url as string;
  },

  /**
   * Delete image (no-op — Cloudinary deletion needs signed server call)
   */
  deleteImage: async (_imageUrl: string): Promise<void> => {
    // Orphans can be cleaned from Cloudinary dashboard if needed.
  },
};
