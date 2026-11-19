import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { fetchSiteSettings } from '@/lib/server/firestoreRest';

export default async function NotFound() {
  const settings = await fetchSiteSettings();
  const jewelryEnabled = settings?.jewelryEnabled === true;

  const links = [
    { href: '/shop', label: 'Shop All' },
    { href: '/shoes', label: 'Shoes' },
    ...(jewelryEnabled ? [{ href: '/jewelry', label: 'Jewellery' }] : []),
    { href: '/blog', label: 'Journal' },
    { href: '/faq', label: 'FAQs' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
      <div className="w-16 h-16 bg-bronze/10 text-bronze rounded-full flex items-center justify-center mx-auto mb-6">
        <Compass size={26} />
      </div>
      <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
        ✦ 404
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
        This page{' '}
        <span className="font-italic-serif text-bronze">doesn&rsquo;t exist</span>
      </h1>
      <p className="text-mocha leading-relaxed mb-8 text-sm md:text-base">
        The link you followed may be broken, or the page may have moved. Try
        one of these instead.
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-stone hover:border-charcoal transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <Link href="/" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Home
      </Link>
    </div>
  );
}
