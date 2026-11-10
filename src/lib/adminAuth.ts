'use client';

/**
 * Admin authentication — Firebase Auth (email/password) + custom claim
 * `admin: true` (set with scripts/set-admin-claim.ts).
 *
 * Two layers, both required:
 *  1. Firestore rules check request.auth.token.admin on every admin
 *     read/write — this is what actually protects the data.
 *  2. The admin UI: the ID token is mirrored into an httpOnly cookie via
 *     /api/admin/session so middleware + the server layout can refuse to
 *     render /admin pages for anyone who isn't a verified admin.
 *
 * Only imported by /admin code, so the storefront never loads firebase/auth.
 */
import { create } from 'zustand';
import {
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import app from '@/lib/firebase';

// Lazy + browser-only: getAuth() at import time breaks server prerendering.
let authInstance: Auth | null = null;
function auth(): Auth {
  if (!authInstance) authInstance = getAuth(app);
  return authInstance;
}

export type AdminStatus = 'loading' | 'signedOut' | 'notAdmin' | 'admin';

interface AdminSessionState {
  status: AdminStatus;
  email: string | null;
}

export const useAdminSession = create<AdminSessionState>(() => ({
  status: 'loading',
  email: null,
}));

async function syncServerSession(user: User | null): Promise<boolean> {
  if (!user) {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
    return false;
  }
  const idToken = await user.getIdToken();
  const res = await fetch('/api/admin/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return res.ok;
}

let started = false;
/** Start listening once; re-syncs the cookie whenever the token refreshes (~hourly). */
export function startAdminAuthListener() {
  if (started || typeof window === 'undefined') return;
  started = true;
  onIdTokenChanged(auth(), async (user) => {
    if (!user) {
      await syncServerSession(null);
      useAdminSession.setState({ status: 'signedOut', email: null });
      return;
    }
    const token = await user.getIdTokenResult();
    if (token.claims.admin !== true) {
      useAdminSession.setState({ status: 'notAdmin', email: user.email });
      await signOut(auth());
      return;
    }
    const ok = await syncServerSession(user);
    useAdminSession.setState({ status: ok ? 'admin' : 'notAdmin', email: user.email });
  });
}

export class NotAdminError extends Error {}

/** Sign in and require the admin claim. Throws NotAdminError if missing. */
export async function adminSignIn(email: string, password: string): Promise<void> {
  const cred = await signInWithEmailAndPassword(auth(), email.trim(), password);
  // Force-refresh so a claim set moments ago by the script is picked up.
  const token = await cred.user.getIdTokenResult(true);
  if (token.claims.admin !== true) {
    await signOut(auth());
    throw new NotAdminError('This account does not have admin access.');
  }
  if (!(await syncServerSession(cred.user))) {
    await signOut(auth());
    throw new NotAdminError('Could not start an admin session. Please try again.');
  }
  useAdminSession.setState({ status: 'admin', email: cred.user.email });
}

export async function adminSignOut(): Promise<void> {
  await signOut(auth());
  await syncServerSession(null);
  useAdminSession.setState({ status: 'signedOut', email: null });
}

/** Fresh ID token for calling admin API routes (e.g. Cloudinary signing). */
export async function getAdminIdToken(): Promise<string> {
  const user = auth().currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken();
}
