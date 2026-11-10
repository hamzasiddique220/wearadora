import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminSdkConfigProblem, verifyAdminToken } from '@/lib/server/firebaseAdmin';
import { clientIp, cloudinaryConfigured } from '@/lib/server/cloudinarySign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin-only production self-check. While signed in to /admin, open
 * https://wearadora.com/api/admin/diagnostics in the same browser.
 * Compare `derivedClientIp` with your own public IP (e.g. whatismyip.com):
 * they must match. If derivedClientIp is a Hostinger/proxy address instead,
 * adjust TRUSTED_PROXY_HOPS.
 */
export async function GET(req: Request) {
  const problem = adminSdkConfigProblem();
  if (problem) {
    return NextResponse.json({ adminSdk: 'NOT_CONFIGURED' }, { status: 500 });
  }
  if (!(await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'not_admin' }, { status: 403 });
  }
  return NextResponse.json(
    {
      adminSdk: 'ok',
      cloudinarySigning: cloudinaryConfigured() ? 'ok' : 'NOT_CONFIGURED',
      appCheckSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ? 'set (baked in at build)' : 'not set',
      enforceAppCheckReviewUploads: process.env.ENFORCE_APP_CHECK_REVIEW_UPLOADS === 'true',
      trustedProxyHops: Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1),
      headers: {
        'x-forwarded-for': req.headers.get('x-forwarded-for'),
        'x-real-ip': req.headers.get('x-real-ip'),
      },
      derivedClientIp: clientIp(req),
      node: process.version,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
