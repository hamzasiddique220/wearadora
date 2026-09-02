import type { Metadata } from 'next';
import AdminShell from './AdminShell';

// robots.ts already disallows crawling /admin/*, but that only stops
// crawling, not indexing — a URL can still get indexed bare (no snippet) if
// ever linked externally. This is the same double-protection pattern already
// used for /cart and /wishlist.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
