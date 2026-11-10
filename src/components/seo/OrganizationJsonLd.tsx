import { STORE_CONFIG, SOCIAL_LINKS, CONTACT_PHONE } from '@/lib/constants';
import type { PriceRange } from '@/lib/priceRange';

interface OrganizationJsonLdProps {
  jewelryEnabled: boolean;
  /** Live min/max from the catalog — see getPriceRange(). */
  priceRange: PriceRange | null;
}

export default function OrganizationJsonLd({
  jewelryEnabled,
  priceRange,
}: OrganizationJsonLdProps) {
  const base = STORE_CONFIG.siteUrl;
  const orgId = `${base}/#organization`;
  const address = {
    '@type': 'PostalAddress',
    addressLocality: 'Karachi',
    addressRegion: 'Sindh',
    addressCountry: 'PK',
  } as const;
  const areaServed = { '@type': 'Country', name: 'Pakistan' } as const;

  const sameAs = [
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.tiktok,
    `https://wa.me/${CONTACT_PHONE.digits}`,
  ];

  // Both are handcrafted; the jewelry is American diamond (artificial).
  const description = jewelryEnabled
    ? 'Pakistani online store selling handcrafted ladies footwear (heels, sandals and slides) made in Karachi, and handcrafted American diamond (artificial) jewelry. Cash on delivery and nationwide delivery across Pakistan.'
    : 'Pakistani online store selling handcrafted ladies footwear (heels, sandals and slides) made in Karachi. Cash on delivery and nationwide delivery across Pakistan.';

  // Organization = brand-level entity. The @id lets other schema (Product,
  // Article) reference the same entity across pages so AI and Google merge
  // the signals into one knowledge-graph entry.
  const organization = {
    '@type': 'Organization',
    '@id': orgId,
    name: STORE_CONFIG.name,
    slogan: STORE_CONFIG.tagline,
    description,
    url: base,
    logo: `${base}/wearadora-profile-cream.png`,
    image: `${base}/opengraph-image`,
    email: STORE_CONFIG.email,
    address,
    areaServed,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: CONTACT_PHONE.dashed,
      email: STORE_CONFIG.email,
      areaServed: 'PK',
      availableLanguage: ['en', 'ur'],
      // Calls + WhatsApp, 24/7.
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'https://schema.org/Monday',
          'https://schema.org/Tuesday',
          'https://schema.org/Wednesday',
          'https://schema.org/Thursday',
          'https://schema.org/Friday',
          'https://schema.org/Saturday',
          'https://schema.org/Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    },
    sameAs,
  };

  // OnlineStore (schema.org: OnlineStore → OnlineBusiness → Organization).
  // Not Store/LocalBusiness — there is no walk-in shop. LocalBusiness-only
  // properties (priceRange, paymentAccepted, currenciesAccepted) aren't valid
  // here, so the live price range is expressed as an AggregateOffer instead.
  const store = {
    '@type': 'OnlineStore',
    '@id': `${base}/#store`,
    name: STORE_CONFIG.name,
    description,
    url: base,
    telephone: CONTACT_PHONE.e164,
    email: STORE_CONFIG.email,
    image: `${base}/opengraph-image`,
    logo: `${base}/wearadora-profile-cream.png`,
    address,
    areaServed,
    parentOrganization: { '@id': orgId },
    sameAs,
    ...(priceRange
      ? {
          makesOffer: {
            '@type': 'AggregateOffer',
            priceCurrency: 'PKR',
            lowPrice: priceRange.min,
            highPrice: priceRange.max,
            offerCount: priceRange.count,
            areaServed,
            acceptedPaymentMethod: [
              'Cash on Delivery',
              'Bank Transfer',
              'Easypaisa',
              'JazzCash',
            ].map((name) => ({ '@type': 'PaymentMethod', name })),
          },
        }
      : {}),
  };

  // No SearchAction: site search is a client-side overlay with no
  // crawlable ?q= results URL for Google to call.
  const website = {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: STORE_CONFIG.name,
    url: base,
    inLanguage: 'en-PK',
    publisher: { '@id': orgId },
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, store, website],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
