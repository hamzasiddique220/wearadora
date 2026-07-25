/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Resize/convert images on Cloudinary's CDN instead of Next's on-server
    // optimizer. The shared Node host (Passenger, 2 worker threads, no reliable
    // sharp) can't optimize fast enough, which made images load slowly.
    // See src/lib/cloudinaryLoader.ts.
    loader: 'custom',
    loaderFile: './src/lib/cloudinaryLoader.ts',
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 64, 88, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'firebase', 'firebase/firestore'],
  },
  async redirects() {
    return [
      {
        // Retired the "American Diamond" collection page. Permanently redirect
        // its old URL to the general jewellery landing so any indexed links or
        // bookmarks don't 404 and search equity carries over to /jewelry.
        source: '/collections/american-diamond-jewellery',
        destination: '/jewelry',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Long-cache the static /public assets (images, wordmark PNGs) that
        // change rarely. Bumping the file name (or query) busts the cache.
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' },
        ],
      },
      {
        source: '/:file(.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' },
        ],
      },
    ];
  },
};

export default nextConfig;
