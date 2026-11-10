import 'server-only';
import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

/**
 * Server-side Firebase Admin for the hosting server (Hostinger has no Google
 * default credentials, so the service account comes from env):
 *
 *   FIREBASE_SERVICE_ACCOUNT_BASE64   base64 of the whole key JSON  (preferred)
 *     — or —
 *   FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY   (literal "\n" escapes OK)
 *
 *   FIREBASE_PROJECT_ID               runtime project id (NEXT_PUBLIC_* is
 *                                     inlined at build time, so don't rely on it)
 *
 * Production REQUIRES credentials: they enable revocation checks (a revoked
 * admin loses access immediately, not up to an hour later). Missing or
 * malformed credentials → admin routes return 500 "admin_sdk_not_configured"
 * and a clear error is logged; the public storefront is unaffected.
 * Outside production (local dev / emulators) it falls back to project-id-only
 * mode, which can still verify ID tokens.
 */

export const ADMIN_COOKIE = 'wa_admin';

export class AdminSdkConfigError extends Error {}

interface Resolved {
  credential: ServiceAccount | null;
  projectId: string | undefined;
}

function resolveCredentials(): Resolved {
  const projectIdEnv = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (b64) {
    let json: Record<string, string>;
    try {
      json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    } catch {
      throw new AdminSdkConfigError(
        'FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64-encoded JSON. Re-encode the key file: base64 -w0 key.json'
      );
    }
    if (!json.client_email || !json.private_key) {
      throw new AdminSdkConfigError('FIREBASE_SERVICE_ACCOUNT_BASE64 decoded, but has no client_email/private_key.');
    }
    return {
      credential: { projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key },
      projectId: projectIdEnv || json.project_id,
    };
  }

  if (email || rawKey) {
    if (!email || !rawKey) {
      throw new AdminSdkConfigError('Set BOTH FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or use FIREBASE_SERVICE_ACCOUNT_BASE64).');
    }
    // hPanel / .env usually store the key on one line with literal "\n";
    // also strip surrounding quotes some panels keep.
    const privateKey = rawKey.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new AdminSdkConfigError('FIREBASE_PRIVATE_KEY does not look like a PEM key (missing "BEGIN PRIVATE KEY").');
    }
    if (!projectIdEnv) {
      throw new AdminSdkConfigError('FIREBASE_PROJECT_ID is required with FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.');
    }
    return { credential: { projectId: projectIdEnv, clientEmail: email, privateKey }, projectId: projectIdEnv };
  }

  if (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new AdminSdkConfigError(
      'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_BASE64 (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) and FIREBASE_PROJECT_ID in the hosting env.'
    );
  }
  return { credential: null, projectId: projectIdEnv };
}

let cached: { app: App; authenticated: boolean; clientEmail?: string } | null = null;
let configError: AdminSdkConfigError | null = null;

function adminApp(): { app: App; authenticated: boolean; clientEmail?: string } {
  if (cached) return cached;
  if (configError) throw configError;
  try {
    const { credential, projectId } = resolveCredentials();
    const app =
      getApps()[0] ||
      initializeApp(credential ? { credential: cert(credential), projectId } : { projectId });
    cached = { app, authenticated: !!credential, clientEmail: credential?.clientEmail };
    return cached;
  } catch (e) {
    configError = e instanceof AdminSdkConfigError ? e : new AdminSdkConfigError(String(e));
    console.error(`[firebase-admin] CONFIG ERROR: ${configError.message}`);
    throw configError;
  }
}

/** null if fine, otherwise the configuration error message. */
export function adminSdkConfigProblem(): string | null {
  try {
    adminApp();
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

/**
 * Startup self-test (called from src/instrumentation.ts): makes one real
 * authenticated call so a bad key shows up in the server log immediately,
 * not at the first admin login.
 */
export async function adminSdkSelfTest(): Promise<void> {
  try {
    const { app, authenticated, clientEmail } = adminApp();
    if (!authenticated) {
      console.warn(`[firebase-admin] running WITHOUT credentials (project ${app.options.projectId}) — dev/emulator mode only.`);
      return;
    }
    await getAuth(app).listUsers(1);
    console.log(`[firebase-admin] authenticated OK as ${clientEmail} (project ${app.options.projectId})`);
  } catch (e) {
    console.error(`[firebase-admin] SELF-TEST FAILED: ${(e as Error).message}`);
  }
}

/** Decoded token if it's valid AND carries admin: true, otherwise null.
 *  Throws AdminSdkConfigError if the server is misconfigured. */
export async function verifyAdminToken(idToken: string | undefined | null): Promise<DecodedIdToken | null> {
  const { app, authenticated } = adminApp(); // throws on config error
  if (!idToken) return null;
  try {
    // With credentials, also reject tokens revoked by `admin:claim --revoke`.
    const decoded = await getAuth(app).verifyIdToken(idToken, authenticated);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

/** True if the App Check token (X-Firebase-AppCheck header) is valid for this project. */
export async function verifyAppCheckToken(token: string): Promise<boolean> {
  try {
    const { getAppCheck } = await import('firebase-admin/app-check');
    await getAppCheck(adminApp().app).verifyToken(token);
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
