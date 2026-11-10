import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/server/firebaseAdmin';
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
  const decoded = await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!decoded) redirect('/admin/login?reason=session');
  return <AdminShell>{children}</AdminShell>;
}
