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

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.replace(/\s*\|.*$/, ''),
    description: post.description,
    author: { '@type': 'Organization', name: STORE_CONFIG.name },
    publisher: {
      '@type': 'Organization',
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
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </>
  );
}
