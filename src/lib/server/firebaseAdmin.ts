import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

/**
 * Server-side Firebase Admin. Verifying ID tokens only needs the project id
 * (Google's public signing keys are fetched automatically), so no service
 * account is required on the hosting server for admin login or Cloudinary
 * signing. If FIREBASE_SERVICE_ACCOUNT_JSON is set (the key file's JSON,
 * optionally base64-encoded) it's used, which also enables revocation checks.
 */
function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  // Runtime var first: NEXT_PUBLIC_* values are inlined at BUILD time.
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return initializeApp({ credential: cert(JSON.parse(json)), projectId });
  }
  return initializeApp({ projectId });
}

export const ADMIN_COOKIE = 'wa_admin';

/** Decoded token if it's valid AND carries admin: true, otherwise null. */
export async function verifyAdminToken(idToken: string | undefined | null): Promise<DecodedIdToken | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(idToken, !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

/** True if the App Check token (X-Firebase-AppCheck header) is valid for this project. */
export async function verifyAppCheckToken(token: string): Promise<boolean> {
  try {
    const { getAppCheck } = await import('firebase-admin/app-check');
    await getAppCheck(adminApp()).verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

/** Reads "Authorization: Bearer <idToken>" and verifies the admin claim. */
export async function verifyAdminRequest(req: Request): Promise<DecodedIdToken | null> {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer (.+)$/i);
  return verifyAdminToken(match?.[1]);
}
