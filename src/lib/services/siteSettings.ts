import {
  doc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteSettings } from '@/types';

const COLLECTION = 'siteSettings';
const DOC_ID = 'main';

export const siteSettingsService = {
  subscribe: (
    callback: (settings: SiteSettings | null) => void
  ): Unsubscribe => {
    const ref = doc(db, COLLECTION, DOC_ID);
    return onSnapshot(
      ref,
      (snap) => {
        callback(snap.exists() ? (snap.data() as SiteSettings) : null);
      },
      (err) => {
        console.error('siteSettings.subscribe error:', err);
        callback(null);
      }
    );
  },

  /** Upsert the single settings doc (merge so partial updates don't wipe other fields) */
  save: async (data: Partial<SiteSettings>): Promise<void> => {
    const ref = doc(db, COLLECTION, DOC_ID);
    await setDoc(
      ref,
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  },

  /** Admin-only signed upload into the site/ folder. */
  uploadImage: async (file: File): Promise<string> => {
    const { uploadAdminImage } = await import('./cloudinaryUpload');
    return uploadAdminImage(file, 'site');
  },
};
