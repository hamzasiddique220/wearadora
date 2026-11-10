import { NextResponse } from 'next/server';
import { verifyAppCheckToken } from '@/lib/server/firebaseAdmin';
import {
  clientIp,
  cloudinaryConfigured,
  rateLimited,
  signUpload,
} from '@/lib/server/cloudinarySign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Customer review photos (customers aren't signed in). Much narrower than
 * the old unsigned preset: one fixed folder, images only, 1-hour signature,
 * and at most 12 signatures per IP per 30 minutes (the form allows 5 photos).
 * App Check: a valid X-Firebase-AppCheck token is required once
 * ENFORCE_APP_CHECK_REVIEW_UPLOADS=true (turn on after the monitoring period).
 */
export async function POST(req: Request) {
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: 'cloudinary_not_configured' }, { status: 500 });
  }
  if (rateLimited(`review-sign:${clientIp(req)}`, 12, 30 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const appCheckToken = req.headers.get('x-firebase-appcheck');
  const appCheckOk = appCheckToken ? await verifyAppCheckToken(appCheckToken) : false;
  if (process.env.ENFORCE_APP_CHECK_REVIEW_UPLOADS === 'true' && !appCheckOk) {
    return NextResponse.json({ error: 'app_check_required' }, { status: 401 });
  }
  return NextResponse.json(signUpload('wearadora/reviews'), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
