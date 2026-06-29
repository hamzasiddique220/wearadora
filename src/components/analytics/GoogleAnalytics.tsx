'use client';

import Script from 'next/script';
import { ANALYTICS_IDS } from '@/lib/analytics';

/**
 * Google Analytics 4 (gtag.js). Self-contained — no extra dependency.
 * Uses NEXT_PUBLIC_GA_ID, falling back to the Firebase GA4 measurement id.
 * Manual page_view tracking on SPA route changes is handled by Analytics.
 */
export default function GoogleAnalytics() {
  const id = ANALYTICS_IDS.ga;
  if (!id) return null;

  return (
    <>
      <Script
        id="ga-loader"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
