'use client';

import { getAppCheckToken } from '@/lib/firebase';

/**
 * Signed Cloudinary uploads. The server (/api/cloudinary/sign*) returns a
 * signature for fixed params; the API secret never reaches the browser and
 * the old unsigned upload preset is no longer used.
 */
interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  params: Record<string, string | number>;
}

async function uploadWithSignature(file: File, signed: SignedUpload): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('signature', signed.signature);
  for (const [k, v] of Object.entries(signed.params)) form.append(k, String(v));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  const url = (await res.json()).secure_url as string;
  // Inject f_auto,q_auto so Cloudinary serves AVIF/WebP at the right quality
  // even when the URL is rendered through a raw <img> (e.g. admin previews).
  return url.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url;
}

async function getSignature(path: string, init: RequestInit): Promise<SignedUpload> {
  const res = await fetch(path, { method: 'POST', ...init });
  if (!res.ok) {
    const code = (await res.json().catch(() => ({})))?.error || res.status;
    throw new Error(`Upload not allowed (${code})`);
  }
  return res.json();
}

/** Admin uploads — requires a signed-in admin (ID token with admin: true). */
export async function uploadAdminImage(
  file: File,
  folder: 'products' | 'site' | 'reviews' = 'products'
): Promise<string> {
  // Dynamic import keeps firebase/auth out of the storefront bundle.
  const { getAdminIdToken } = await import('@/lib/adminAuth');
  const idToken = await getAdminIdToken();
  const signed = await getSignature('/api/cloudinary/sign', {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ folder }),
  });
  return uploadWithSignature(file, signed);
}

/** Customer review photos — rate-limited, fixed folder, App Check token attached. */
export async function uploadReviewImage(file: File): Promise<string> {
  const appCheck = await getAppCheckToken();
  const signed = await getSignature('/api/cloudinary/sign-review', {
    headers: appCheck ? { 'X-Firebase-AppCheck': appCheck } : {},
  });
  return uploadWithSignature(file, signed);
}
