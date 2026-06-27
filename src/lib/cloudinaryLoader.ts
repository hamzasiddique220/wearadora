/**
 * Custom Next.js image loader.
 *
 * Product images live on Cloudinary's CDN, so we let Cloudinary do the
 * resizing + format conversion (f_auto → AVIF/WebP) instead of routing every
 * request through Next's built-in optimizer. On our shared Node host (Passenger,
 * 2 worker threads, no reliable `sharp`) that optimizer is the bottleneck that
 * makes images load slowly — this offloads all of it to Cloudinary's CDN.
 *
 * Non-Cloudinary URLs (local /public assets, Firebase, Unsplash) are returned
 * untouched so they load directly without going through the slow optimizer.
 */
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  // Only Cloudinary delivery URLs support inline transformations.
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
    // Append width as a URL fragment so Next.js considers each width a
    // distinct URL (silences `next-image-missing-loader-width`). Hash is
    // stripped by the browser before the network request, so the underlying
    // file/asset still resolves the same and caching isn't duplicated.
    return `${src}#w=${width}`;
  }

  const q = quality ?? 'auto';
  // f_auto = best format (AVIF/WebP), c_limit = never upscale past the original.
  const transform = `f_auto,q_${q},w_${width},c_limit`;

  const [base, after] = src.split('/upload/');
  // Drop the static "f_auto,q_auto/" we inject at upload time so it isn't duped.
  const cleaned = after.replace(/^f_auto,q_auto\//, '');

  return `${base}/upload/${transform}/${cleaned}`;
}
