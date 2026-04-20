import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Hammer, Heart, Tag, MapPin, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Us | WEARADORA',
  description:
    'Four decades of handcrafted ladies footwear — comfort, design, and unbeatable value. Meet the family behind WEARADORA.',
};

export default function AboutPage() {
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
      desc: 'Our workshop and branch are both in Karachi, Pakistan — shipping nationwide in 2–3 days.',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-14">
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ About WEARADORA
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-light mt-4 mb-6">
          Four decades of{' '}
          <span className="font-italic-serif text-bronze">handcrafted</span>
          <br />
          ladies footwear
        </h1>
        <p className="text-lg text-mocha leading-relaxed max-w-2xl mx-auto">
          WEARADORA is a family-run workshop with{' '}
          <strong className="text-charcoal">40+ years of experience</strong> in
          crafting ladies shoes — slides, heels, sandals and more. What started as
          a single cobbler&rsquo;s bench has grown into a full collection, but the
          philosophy stays the same: <em>make shoes you&rsquo;d be proud to put
          your name on.</em>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {values.map((v, i) => (
          <div
            key={i}
            className="bg-white border border-stone/70 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-11 h-11 bg-bronze/10 text-bronze rounded-full flex items-center justify-center mb-4">
              {v.icon}
            </div>
            <h3 className="font-serif text-xl mb-2">{v.title}</h3>
            <p className="text-sm text-mocha leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="relative overflow-hidden p-8 md:p-12 text-center grain"
        style={{
          background: 'linear-gradient(135deg, #1a1614 0%, #2a2320 100%)',
          color: '#f5f1ea',
        }}
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Why women pick WEARADORA
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-light mt-3 mb-5 leading-tight">
          Comfort of a pair you&rsquo;ve owned for years —
          <br />
          <span className="font-italic-serif text-bronze">on day one.</span>
        </h2>
        <p className="max-w-2xl mx-auto text-stone/90 text-sm md:text-base leading-relaxed mb-8">
          When you&rsquo;ve been making women&rsquo;s shoes for 40+ years, you
          learn which straps dig in, which heels wobble, which soles crack. Every
          WEARADORA pair is built with those lessons baked in — then finished with
          the embellishment and design detail our customers keep coming back for.
          And because we make in-house, you get it at a fraction of what big
          brands charge.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/slippers" className="hero-cta hero-cta--on-dark">
            Shop Shoes
          </Link>
          <Link href="/jewelry" className="hero-cta hero-cta--outline-on-dark">
            Shop Jewelry
          </Link>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-mocha">
        Karachi-based · Delivery in {STORE_CONFIG.deliveryDays} · Free delivery on
        2 or more items · WhatsApp orders on {STORE_CONFIG.phoneDisplay}
      </div>
    </div>
  );
}
