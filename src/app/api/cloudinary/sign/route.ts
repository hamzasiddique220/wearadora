import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/firebaseAdmin';
import { cloudinaryConfigured, signUpload } from '@/lib/server/cloudinarySign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FOLDERS = { products: 'wearadora/products', site: 'wearadora/site', reviews: 'wearadora/reviews' } as const;

/**
 * Admin uploads (products, site settings, admin-added review photos).
 * Requires "Authorization: Bearer <Firebase ID token>" with admin: true.
 * Body: { folder: 'products' | 'site' | 'reviews' }
 */
export async function POST(req: Request) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'not_admin' }, { status: 403 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: 'cloudinary_not_configured' }, { status: 500 });
  }
  let folder: keyof typeof FOLDERS = 'products';
  try {
    const body = await req.json();
    if (body?.folder in FOLDERS) folder = body.folder;
  } catch {
    /* default folder */
  }
  return NextResponse.json(signUpload(FOLDERS[folder]), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
