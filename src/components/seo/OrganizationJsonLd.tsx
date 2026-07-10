import { STORE_CONFIG, SOCIAL_LINKS } from '@/lib/constants';

export default function OrganizationJsonLd() {
  const orgId = `${STORE_CONFIG.siteUrl}/#organization`;
  const address = {
    '@type': 'PostalAddress',
    addressLocality: 'Karachi',
    addressRegion: 'Sindh',
    addressCountry: 'PK',
  } as const;

  const sameAs = [
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.tiktok,
  ];

  // Organization = brand-level entity. The @id lets other schema (Product,
  // Article, LocalBusiness) reference the same entity across pages so AI
  // and Google merge the signals into one knowledge-graph entry.
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    // Proper brand name for Google's Knowledge Graph / SERP site name; the
    // stylised wordmark "WEARADORA" is kept as an alternate name.
    name: STORE_CONFIG.brandName,
    alternateName: STORE_CONFIG.name,
    slogan: STORE_CONFIG.tagline,
    description:
      'Pakistani online store offering handcrafted artificial jewellery (American diamond / zircon necklace sets, bridal chokers, earrings, bracelets) and ladies footwear, based in Karachi.',
    url: STORE_CONFIG.siteUrl,
    logo: `${STORE_CONFIG.siteUrl}/wearadora-profile-cream.png`,
    image: `${STORE_CONFIG.siteUrl}/opengraph-image`,
    email: STORE_CONFIG.email,
    address,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${STORE_CONFIG.whatsappNumber}`,
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs,
  };

  // Store schema (subclass of LocalBusiness) — surfaces WEARADORA for
  // "jewellery store in Pakistan / Karachi" style questions in AI answers
  // and Google's local pack.
  const store = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${STORE_CONFIG.siteUrl}/#store`,
    name: STORE_CONFIG.brandName,
    alternateName: STORE_CONFIG.name,
    description:
      'Affordable artificial jewellery (American diamond / zircon) and handcrafted ladies footwear, shipping nationwide across Pakistan.',
    url: STORE_CONFIG.siteUrl,
    telephone: `+${STORE_CONFIG.whatsappNumber}`,
    email: STORE_CONFIG.email,
    image: `${STORE_CONFIG.siteUrl}/opengraph-image`,
    address,
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    priceRange: 'Rs. 499 – Rs. 3,999',
    paymentAccepted: 'Cash on Delivery, Bank Transfer, Easypaisa, JazzCash',
    currenciesAccepted: 'PKR',
    parentOrganization: { '@id': orgId },
    sameAs,
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, store],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
