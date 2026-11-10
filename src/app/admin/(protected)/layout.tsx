import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, adminSdkConfigProblem, verifyAdminToken } from '@/lib/server/firebaseAdmin';
import AdminShell from './AdminShell';

// Never cache: every request re-verifies the session.
export const dynamic = 'force-dynamic';

/**
 * Server-side gate for every /admin page except /admin/login: the session
 * cookie must hold a valid Firebase ID token with admin: true. Middleware
 * already bounced requests with no cookie; this catches expired, forged or
 * non-admin tokens.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (adminSdkConfigProblem()) {
    // Don't bounce to login (that would loop); say what's wrong. Details are
    // in the server log, never shown to the browser.
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="font-serif text-2xl mb-3">Admin is unavailable</h1>
          <p className="text-sm text-mocha">
            The server&apos;s Firebase Admin credentials are missing or invalid. Check the
            hosting env vars (FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_CLIENT_EMAIL +
            FIREBASE_PRIVATE_KEY, and FIREBASE_PROJECT_ID) and the server log.
          </p>
        </div>
      </div>
    );
  }
  const decoded = await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!decoded) redirect('/admin/login?reason=session');
  return <AdminShell>{children}</AdminShell>;
}
