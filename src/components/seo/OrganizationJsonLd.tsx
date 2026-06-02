import { STORE_CONFIG, SOCIAL_LINKS } from '@/lib/constants';

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: STORE_CONFIG.name,
    alternateName: STORE_CONFIG.tagline,
    url: STORE_CONFIG.siteUrl,
    logo: `${STORE_CONFIG.siteUrl}/wearadora-monogram.jpg`,
    image: `${STORE_CONFIG.siteUrl}/opengraph-image`,
    email: STORE_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressCountry: 'PK',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${STORE_CONFIG.whatsappNumber}`,
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.tiktok,
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
