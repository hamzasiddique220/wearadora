import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST { idToken } → verifies the Firebase ID token has admin: true and
 * mirrors it into an httpOnly cookie, so middleware and the /admin server
 * layout can gate pages. The client re-posts on every token refresh.
 * DELETE → clears the cookie (sign-out).
 */
export async function POST(req: Request) {
  let idToken: string | undefined;
  try {
    idToken = (await req.json())?.idToken;
  } catch {
    /* fallthrough */
  }
  const decoded = await verifyAdminToken(idToken);
  if (!decoded || !idToken) {
    const res = NextResponse.json({ error: 'not_admin' }, { status: 403 });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }
  const maxAge = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
