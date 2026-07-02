import type { Metadata } from 'next';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: { absolute: 'Frequently Asked Questions | WEARADORA' },
  description:
    'Answers about WEARADORA artificial jewellery (American diamond / zircon), delivery, returns and orders across Pakistan.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: `FAQs | ${STORE_CONFIG.name}`,
    description:
      'Answers about WEARADORA — artificial jewellery, delivery, returns and orders.',
    url: `${STORE_CONFIG.siteUrl}/faq`,
    type: 'website',
  },
};

interface Faq {
  q: string;
  a: string;
}

const faqs: Faq[] = [
  {
    q: 'What is American diamond jewellery?',
    a: 'American diamond is another name for zircon (cubic zirconia) — a high-clarity synthetic stone that mimics the brilliance of a real diamond at a fraction of the price. All WEARADORA jewellery is handcrafted with high-grade American diamond (zircon) stones set in a polished gold-tone finish over a base metal.',
  },
  {
    q: 'Is your jewellery real gold or artificial?',
    a: 'All WEARADORA jewellery is artificial (also called fashion or bridal jewellery). Each piece has a polished gold-tone, silver-tone or rose-tone metal finish over a base metal — never solid gold. The stones are American diamond (zircon / cubic zirconia) rather than real diamonds.',
  },
  {
    q: 'Is artificial jewellery good for weddings?',
    a: 'Yes — high-quality artificial jewellery is an ideal choice for weddings, barat, walima, mehndi and Eid. It gives you the sparkle and design of fine bridal jewellery without the price or security worry, so you can wear something bold on your big day and still build a versatile collection for the years ahead.',
  },
  {
    q: 'What is the difference between American diamond (zircon) and a real diamond?',
    a: 'Real diamonds are natural carbon crystals graded on cut, clarity, colour and carat. American diamond (zircon / cubic zirconia) is a lab-made stone chosen for its clarity and sparkle. To the naked eye they look similar, but real diamonds are far more expensive and long-lived. Zircon is perfect for fashion and bridal pieces where the look matters most.',
  },
  {
    q: 'How do I care for artificial and gold-tone jewellery?',
    a: 'Put your jewellery on last (after hair, makeup and perfume) and take it off first when you get home. Keep it away from water, sweat, perfume and lotions. Wipe with a soft dry cloth after wearing and store each piece separately in an airtight pouch or box. A small silica gel packet inside your jewellery box slows tarnishing. See our full care guide on the WEARADORA Journal.',
  },
  {
    q: 'How much does delivery cost across Pakistan?',
    a: `Delivery is FREE on orders of Rs ${STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')} and above. For smaller orders, a flat delivery charge of Rs ${STORE_CONFIG.deliveryFee} applies. Estimated delivery time is ${STORE_CONFIG.deliveryDays} nationwide.`,
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes — Cash on Delivery is available anywhere in Pakistan. You pay the rider when the parcel arrives. We also accept bank transfer, Easypaisa and JazzCash.',
  },
  {
    q: 'What is your return / exchange policy?',
    a: 'You can request a return or exchange within 7 days of receiving your order. Items must be unused, in their original packaging, and returned with the order number. For hygiene reasons, earrings can be exchanged but are not eligible for refund unless they arrive damaged. Full details are on our Return & Exchange Policy page.',
  },
  {
    q: 'What if my order arrives damaged, defective or wrong?',
    a: 'Contact us on WhatsApp within 48 hours of delivery with photos of the item. We will arrange a free replacement or full refund of the item price, and WEARADORA will cover the return shipping in these cases. Original delivery charges are non-refundable.',
  },
  {
    q: 'How can I place an order?',
    a: 'Add pieces to your cart on wearadora.com, tap Checkout, fill in your address, and we’ll confirm your order on WhatsApp before it ships. You can also place orders directly on WhatsApp — the button is on every page of the site.',
  },
  {
    q: 'Where is WEARADORA based and where do you ship?',
    a: 'WEARADORA is a Pakistani brand based in Karachi. We ship nationwide across Pakistan — Karachi, Lahore, Islamabad, Punjab, KPK, Balochistan and everywhere in between.',
  },
  {
    q: 'How can I contact you?',
    a: `You can reach us on WhatsApp at ${STORE_CONFIG.phoneDisplay} or email ${STORE_CONFIG.email}. Our team usually replies within a few hours during business days.`,
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'FAQs' }]} />
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Frequently Asked Questions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
            Answers you might{' '}
            <span className="font-italic-serif text-bronze">be looking for</span>
          </h1>
          <p className="text-mocha leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            Quick answers about WEARADORA artificial jewellery, delivery,
            returns and orders across Pakistan.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-charcoal/10 rounded-md p-5 md:p-6 bg-cream/40 open:bg-cream/70 transition-colors"
            >
              <summary className="cursor-pointer list-none font-serif text-lg md:text-xl text-charcoal flex items-start justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-bronze text-2xl leading-none shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-mocha text-sm md:text-base leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 md:mt-14 text-center">
          <p className="text-mocha text-sm mb-4">
            Question still not answered?
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.25em] uppercase border border-charcoal text-charcoal px-6 py-3 hover:bg-charcoal hover:text-cream transition-colors"
            >
              WhatsApp Us
            </a>
            <Link
              href="/return-policy"
              className="text-xs tracking-[0.25em] uppercase border border-stone text-mocha px-6 py-3 hover:border-bronze hover:text-bronze transition-colors"
            >
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
