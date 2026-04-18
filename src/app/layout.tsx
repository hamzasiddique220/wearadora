import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Toast from '@/components/ui/Toast';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`,
  description:
    'Discover handcrafted jewelry and artisan footwear. Curated pieces for those who appreciate timeless elegance.',
  keywords: ['jewelry', 'footwear', 'handcrafted', 'Pakistan', 'necklaces', 'rings', 'sandals'],
  openGraph: {
    title: STORE_CONFIG.name,
    description: STORE_CONFIG.tagline,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ScrollProgress />
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
