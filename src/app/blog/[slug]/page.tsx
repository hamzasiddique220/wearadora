import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STORE_CONFIG } from '@/lib/constants';
import { getBlogPost, listBlogSlugs } from '@/lib/blog';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'This article may have been moved or removed.',
      robots: { index: false, follow: false },
    };
  }
  const url = `${STORE_CONFIG.siteUrl}/blog/${post.slug}`;
  return {
    // `absolute` bypasses the root layout's `| Wear Adora` template since the
    // frontmatter title already ends with the brand.
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      siteName: STORE_CONFIG.name,
      ...(post.datePublished ? { publishedTime: post.datePublished } : {}),
      ...(post.dateModified ? { modifiedTime: post.dateModified } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();
  const orgId = `${STORE_CONFIG.siteUrl}/#organization`;

  // Visible, machine-readable dates right under the article's H1.
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  const validDate = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
  const dateParts: string[] = [];
  if (validDate(post.datePublished)) {
    dateParts.push(`Published <time datetime="${post.datePublished}">${fmt(post.datePublished!)}</time>`);
  }
  if (validDate(post.dateModified) && post.dateModified !== post.datePublished) {
    dateParts.push(`Updated <time datetime="${post.dateModified}">${fmt(post.dateModified!)}</time>`);
  }
  const dateLine = dateParts.length
    ? `<p class="blog-dates">By ${STORE_CONFIG.name} · ${dateParts.join(' · ')}</p>`
    : '';
  const html = dateLine ? post.html.replace(/<\/h1>/, `</h1>${dateLine}`) : post.html;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.replace(/\s*\|.*$/, ''),
    description: post.description,
    image: `${STORE_CONFIG.siteUrl}/opengraph-image`,
    ...(post.datePublished ? { datePublished: post.datePublished } : {}),
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
    wordCount: post.wordCount,
    author: { '@type': 'Organization', '@id': orgId, name: STORE_CONFIG.name },
    publisher: {
      '@type': 'Organization',
      '@id': orgId,
      name: STORE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${STORE_CONFIG.siteUrl}/wearadora-wordmark-dark.png`,
      },
    },
    mainEntityOfPage: `${STORE_CONFIG.siteUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs
          items={[
            { label: 'Journal', href: '/blog' },
            { label: post.title.replace(/\s*\|.*$/, '') },
          ]}
        />
      </div>

      <article
        className="blog-article max-w-[800px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
