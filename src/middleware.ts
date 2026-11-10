import { NextResponse, type NextRequest } from 'next/server';

/**
 * First gate for /admin: no admin session cookie → straight to login.
 * (Edge runtime can't run firebase-admin, so this only checks presence; the
 * token itself is verified in src/app/admin/(protected)/layout.tsx, and the
 * DATA is protected by Firestore rules regardless of what the UI does.)
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  if (!req.cookies.get('wa_admin')?.value) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
