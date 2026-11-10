import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken,
  type AppCheck,
} from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * App Check (reCAPTCHA v3) — browser only, and only when a site key is set.
 * Must be initialised BEFORE Firestore is used so every request carries a
 * token. Until App Check is *enforced* in the Firebase console, missing or
 * invalid tokens are only counted in metrics, never rejected.
 * Local dev: set NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN=true once, copy the debug
 * token printed in the console into Firebase → App Check → Manage debug tokens.
 */
let appCheck: AppCheck | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY) {
  if (process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN) {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN === 'true'
        ? true
        : process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
  }
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('App Check init failed', err);
  }
}

/** Current App Check token, or null if App Check isn't configured. */
export async function getAppCheckToken(): Promise<string | null> {
  if (!appCheck) return null;
  try {
    return (await getToken(appCheck, false)).token;
  } catch {
    return null;
  }
}

export const db: Firestore = getFirestore(app);
export default app;
