import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Wishlist',
  description: 'Save your favourite handcrafted pieces for later.',
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
