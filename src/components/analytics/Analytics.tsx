'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import MetaPixel from './MetaPixel';
import TikTokPixel from './TikTokPixel';
import GoogleAnalytics from './GoogleAnalytics';
import { trackPageView } from '@/lib/analytics';

/**
 * Single entry point for all marketing/analytics tags. Each child renders
 * nothing unless its pixel id is configured, so this is safe to always mount.
 *
 * The pixel init scripts already fire the first PageView; this only sends
 * PageView on subsequent client-side (SPA) route changes.
 */
export default function Analytics() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (pathname?.startsWith('/admin')) return;
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      <MetaPixel />
      <TikTokPixel />
      <GoogleAnalytics />
    </>
  );
}
