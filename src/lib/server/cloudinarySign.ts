import 'server-only';
import crypto from 'node:crypto';

/**
 * Cloudinary signed-upload parameters. CLOUDINARY_API_SECRET never leaves
 * the server; the browser only receives a signature that's valid for these
 * exact parameters (folder, formats, timestamp) for ~1 hour.
 * Docs: https://cloudinary.com/documentation/authentication_signatures
 */
export const UPLOAD_FORMATS = 'jpg,jpeg,png,webp,avif';

export interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  /** Every signed param the client must send back unchanged. */
  params: Record<string, string | number>;
}

function cloudName(): string | undefined {
  return process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

export function cloudinaryConfigured(): boolean {
  return !!(
    cloudName() &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function signUpload(folder: string): SignedUpload {
  const name = cloudName()!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    allowed_formats: UPLOAD_FORMATS,
    folder,
    timestamp,
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = crypto.createHash('sha1').update(toSign + secret).digest('hex');
  return { cloudName: name, apiKey, timestamp, signature, params };
}

/** Tiny per-process sliding-window rate limiter (good enough for a 2-worker host). */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // bound memory
  return recent.length > max;
}

/**
 * Real client IP behind Hostinger's LiteSpeed proxy.
 *
 * X-Forwarded-For is "client, proxy1, proxy2…" and every proxy APPENDS the
 * address it received the request from. The LEFTMOST entries are whatever
 * the client sent (spoofable — taking [0] would let anyone dodge the rate
 * limit by sending a random X-Forwarded-For). So count TRUSTED_PROXY_HOPS
 * from the right: with one trusted proxy (LiteSpeed) the real client is the
 * LAST entry. Verify on production with /api/admin/diagnostics and raise
 * TRUSTED_PROXY_HOPS only if another proxy/CDN is added in front.
 */
export function clientIp(req: Request): string {
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
  const chain = (req.headers.get('x-forwarded-for') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (chain.length > 0) return chain[Math.max(0, chain.length - hops)];
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
