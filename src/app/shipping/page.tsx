import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shipping & Returns | Wear Adora',
  description:
    'Delivery times across Pakistan and our 7-day refund & exchange policy.',
  alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
  const zones = [
    {
      icon: <MapPin size={22} />,
      city: 'Karachi',
      cod: '4–5 working days',
      urgent: '1 working day (with online payment)',
    },
    {
      icon: <MapPin size={22} />,
      city: 'Punjab',
      cod: '6–7 working days',
      urgent: '2 working days (with online payment)',
    },
    {
      icon: <MapPin size={22} />,
      city: 'KPK & Baluchistan',
      cod: '6–7 working days',
      urgent: null,
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-14">
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Shipping & Returns
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-light mt-4 mb-6">
          Quick to your door,
          <br />
          <span className="font-italic-serif text-bronze">easy to exchange.</span>
        </h1>
        <p className="text-lg text-mocha leading-relaxed max-w-2xl mx-auto">
          Nationwide delivery from our Karachi workshop, with simple 7-day
          exchange or refund on anything that arrives faulty.
        </p>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-bronze/10 text-bronze rounded-full flex items-center justify-center">
            <Truck size={22} />
          </div>
          <h2 className="font-serif text-3xl">Delivery Times</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {zones.map((z) => (
            <div
              key={z.city}
              className="bg-white border border-stone/70 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-bronze mb-3">
                {z.icon}
                <h3 className="font-serif text-xl text-charcoal">{z.city}</h3>
              </div>
              <div className="space-y-2 text-sm text-mocha">
                <div>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-bronze block mb-0.5">
                    Cash on Delivery
                  </span>
                  {z.cod}
                </div>
                {z.urgent && (
                  <div>
                    <span className="text-[10px] tracking-[0.25em] uppercase text-bronze block mb-0.5">
                      Urgent
                    </span>
                    {z.urgent}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-bronze/10 text-bronze rounded-full flex items-center justify-center">
            <RefreshCw size={22} />
          </div>
          <h2 className="font-serif text-3xl">Refund & Exchange</h2>
        </div>

        <div className="bg-white border border-stone/70 p-6 md:p-8 space-y-4 text-sm md:text-base text-mocha leading-relaxed">
          <p>
            <strong className="text-charcoal">7-day window.</strong> If your
            order arrives broken, damaged or faulty, we&rsquo;ll exchange or
            refund the same product within{' '}
            <strong className="text-charcoal">7 days</strong> of receipt.
          </p>
          <p>
            Spotted a fault? Contact our customer service helpline straight away
            and we&rsquo;ll sort it out for you.
          </p>
          <p>
            Just not in love with your order? Reach{' '}
            <a
              href={`mailto:${STORE_CONFIG.email}`}
              className="text-bronze hover:text-charcoal underline underline-offset-2"
            >
              {STORE_CONFIG.email}
            </a>{' '}
            — in many cases we can offer you an exchange for another piece.
          </p>
        </div>
      </section>

      <div
        className="relative overflow-hidden p-8 md:p-12 text-center grain"
        style={{
          background: 'linear-gradient(135deg, #1a1614 0%, #2a2320 100%)',
          color: '#f5f1ea',
        }}
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Need help with an order?
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light mt-3 mb-6 leading-tight">
          We&rsquo;re a message away.
        </h2>
        <div className="flex gap-3 justify-center flex-wrap text-sm">
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta--on-dark inline-flex items-center gap-2"
          >
            <Phone size={14} /> WhatsApp Us
          </a>
          <a
            href={`mailto:${STORE_CONFIG.email}`}
            className="hero-cta hero-cta--outline-on-dark inline-flex items-center gap-2"
          >
            <Mail size={14} /> Email Support
          </a>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-mocha">
        Karachi-based · Free delivery on orders Rs 4,500+ · WhatsApp orders on{' '}
        <Link
          href={`tel:+92${STORE_CONFIG.whatsappNumber.slice(2)}`}
          className="text-bronze hover:text-charcoal"
        >
          {STORE_CONFIG.phoneDisplay}
        </Link>
      </div>
    </div>
  );
}
