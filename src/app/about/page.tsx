import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Hammer, Heart, Tag, MapPin, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';
import { fetchSiteSettings } from '@/lib/server/firestoreRest';

export const metadata: Metadata = {
  title: 'About Us | Wear Adora',
  description:
    'Wear Adora is a Pakistani online store offering affordable handcrafted artificial jewellery (American diamond / zircon) and 40+ years of ladies footwear, shipping nationwide from Karachi.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const settings = await fetchSiteSettings();
  const jewelryEnabled = settings?.jewelryEnabled === true;

  const values = [
    {
      icon: <Award size={22} />,
      title: '40+ Years of Craft',
      desc: 'Four decades refining every stitch, every last, every strap — a family workshop tradition passed down by master cobblers.',
    },
    {
      icon: <Hammer size={22} />,
      title: 'Handmade, Not Factory-Made',
      desc: 'Every pair is cut, shaped and finished by hand. No assembly-line shortcuts — the same pair of hands sees a shoe through.',
    },
    {
      icon: <Heart size={22} />,
      title: 'Comfort + Design',
      desc: 'Lightweight soles, cushioned footbeds and foot-friendly lasts — built so you can wear them all day without compromising the look.',
    },
    {
      icon: <Tag size={22} />,
      title: 'Honest Prices',
      desc: 'Priced well below major brands for the same (or better) craftsmanship. We cut out the middleman, not the quality.',
    },
    {
      icon: <Sparkles size={22} />,
      title: 'Mega Sale On',
      desc: 'New collection + seasonal markdowns active now. Our most popular styles are moving fast.',
    },
    {
      icon: <MapPin size={22} />,
      title: 'Made in Karachi',
      desc: 'Our workshop and warehouse are in Karachi; we sell online only and deliver across Pakistan.',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
          ✦ About Wear Adora
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-light mt-3 md:mt-4 mb-4 md:mb-6">
          Handcrafted{' '}
          <span className="font-italic-serif text-bronze">jewellery</span>{' '}
          &amp; footwear
          <br />
          from Karachi, Pakistan
        </h1>
        <p className="text-[14px] sm:text-base md:text-lg text-mocha leading-relaxed max-w-2xl mx-auto">
          Wear Adora is a Pakistani online store offering affordable handcrafted{' '}
          <strong className="text-charcoal">artificial jewellery</strong> —
          premium necklace sets, bridal choker sets, earrings and bracelets —
          alongside a family-run{' '}
          <strong className="text-charcoal">40+ years</strong> of ladies footwear
          (slides, heels and sandals). Prices from around Rs. 499, free
          delivery on orders over Rs {STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')} and a 7-day return across Pakistan.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
        {values.map((v, i) => (
          <div
            key={i}
            className="bg-white border border-stone/70 p-5 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-11 h-11 bg-bronze/10 text-bronze rounded-full flex items-center justify-center mb-3 md:mb-4">
              {v.icon}
            </div>
            <h3 className="font-serif text-lg md:text-xl mb-2">{v.title}</h3>
            <p className="text-[13px] md:text-sm text-mocha leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="relative overflow-hidden p-6 sm:p-8 md:p-12 text-center grain"
        style={{
          background: 'linear-gradient(135deg, #1a1614 0%, #2a2320 100%)',
          color: '#f5f1ea',
        }}
      >
        <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
          ✦ Why women pick Wear Adora
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-light mt-3 mb-4 md:mb-5 leading-tight">
          Comfort of a pair you&rsquo;ve owned for years —
          <br />
          <span className="font-italic-serif text-bronze">on day one.</span>
        </h2>
        <p className="max-w-2xl mx-auto text-stone/90 text-[13px] sm:text-sm md:text-base leading-relaxed mb-6 md:mb-8">
          When you&rsquo;ve been making women&rsquo;s shoes for 40+ years, you
          learn which straps dig in, which heels wobble, which soles crack. Every
          Wear Adora pair is built with those lessons baked in — then finished with
          the embellishment and design detail our customers keep coming back for.
          And because we make in-house, you get it at a fraction of what big
          brands charge.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/slippers" className="hero-cta hero-cta--on-dark">
            Shop Shoes
          </Link>
          {jewelryEnabled && (
            <Link href="/jewelry" className="hero-cta hero-cta--outline-on-dark">
              Shop Jewelry
            </Link>
          )}
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-mocha">
        Karachi-based · Delivery in {STORE_CONFIG.deliveryDays} · Free delivery
        on orders Rs 4,500+ · WhatsApp orders on {STORE_CONFIG.phoneDisplay}
      </div>
    </div>
  );
}
