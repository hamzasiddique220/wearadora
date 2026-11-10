import type { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_CONFIG,
  CONTACT_PHONE,
  DELIVERY_TEXT,
  DELIVERY_TIMES,
} from '@/lib/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// DRAFT — assembled only from policies already published on the site
// (/shipping, /return-policy, /faq, /privacy, STORE_CONFIG). Nothing new is
// promised here. Items still needing a business/legal decision are marked
// TODO(business) in comments and are NOT shown to visitors.
// Keep noindex until the owner has reviewed it; then remove `robots` below
// and add /terms to src/app/sitemap.ts.
export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Terms and conditions for shopping at ${STORE_CONFIG.name}: orders, payment, delivery, exchanges and returns.`,
  alternates: { canonical: '/terms' },
  robots: { index: false, follow: true },
};

const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');

const linkClass = 'text-bronze underline underline-offset-4';

export default function TermsPage() {
  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: '1. About these terms',
      body: (
        <p>
          These terms apply to every order placed with {STORE_CONFIG.name},
          whether through wearadora.com or on WhatsApp. {STORE_CONFIG.name} is
          an online-only store; our workshop and warehouse are in Karachi,
          Pakistan, and we deliver across Pakistan. By placing an order you
          agree to these terms and to our{' '}
          <Link href="/return-policy" className={linkClass}>
            Return &amp; Exchange Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      ),
    },
    {
      title: '2. Our products',
      body: (
        // TODO(business): add a line on colour/finish variation between
        // product photos and the real item, if you want one — not currently
        // stated anywhere on the site.
        <p>
          We sell handcrafted ladies footwear (heels, sandals and slides) and
          handcrafted American diamond jewelry. Our jewelry is artificial
          (fashion) jewelry with a gold-, silver- or rose-tone finish over a
          base metal; it is not solid gold and the stones are not real
          diamonds. Shoes use standard Pakistani/UK sizes and fit true to size.
        </p>
      ),
    },
    {
      title: '3. Orders and confirmation',
      body: (
        // TODO(business): state whether Wear Adora may cancel or refuse an
        // order (e.g. unreachable customer, out of stock, pricing error) and
        // what happens to any advance payment in that case.
        <p>
          Orders placed through the website checkout are confirmed with you by
          call or WhatsApp before they ship. You can also order directly on
          WhatsApp at {CONTACT_PHONE.display}. Items are subject to
          availability.
        </p>
      ),
    },
    {
      title: '4. Prices and delivery charges',
      body: (
        // TODO(business): policy for price changes and for obvious pricing
        // errors on the site — not currently published.
        <p>
          All prices are in Pakistani Rupees (PKR). Delivery is free on orders
          of Rs {free} and above; smaller orders have a flat delivery charge of
          Rs {STORE_CONFIG.deliveryFee}. Delivery charges are non-refundable.
        </p>
      ),
    },
    {
      title: '5. Payment',
      body: (
        <p>
          Cash on Delivery (COD) is available anywhere in Pakistan: you pay the
          rider when your parcel arrives. We also accept bank transfer,
          Easypaisa and JazzCash.
        </p>
      ),
    },
    {
      title: '6. Delivery',
      body: (
        <p>
          Estimated delivery is {DELIVERY_TEXT.karachi} in Karachi and{' '}
          {DELIVERY_TEXT.restOfPakistan} elsewhere in Pakistan. With online
          payment, urgent delivery takes {DELIVERY_TIMES.urgent.karachi}{' '}
          working day in Karachi and {DELIVERY_TIMES.urgent.punjab} working
          days in Punjab. Delivery times are estimates. See{' '}
          <Link href="/shipping" className={linkClass}>
            Shipping &amp; Delivery
          </Link>{' '}
          for details.
        </p>
      ),
    },
    {
      title: '7. Exchanges, returns and refunds',
      body: (
        <>
          <p>
            You may request an exchange or return within 7 days of receiving
            your order. Items must be unused, in their original packaging, and
            come with your order number. Earrings can be exchanged but not
            refunded, unless they arrive damaged or faulty.
          </p>
          <p>
            If an item arrives damaged, defective or wrong, contact us within
            48 hours of delivery with photos; we will arrange a free
            replacement or a refund of the item price and cover the return
            shipping. For change-of-mind returns and exchanges, the customer
            pays the return shipping. Refunds are typically processed within
            5–7 business days of us receiving the item. Full details are in
            our{' '}
            <Link href="/return-policy" className={linkClass}>
              Return &amp; Exchange Policy
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      title: '8. Your information',
      body: (
        <p>
          We use the details you give us (name, phone, address) to process and
          deliver your order. See our{' '}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      ),
    },
    // TODO(business/legal): sections on intellectual property (site photos
    // and designs), limitation of liability, governing law (Pakistan) and
    // changes to these terms. Have these reviewed before adding.
    {
      title: '9. Contact',
      body: (
        <p>
          Call or WhatsApp {CONTACT_PHONE.display} ({CONTACT_PHONE.international}
          ), available 24/7, or email {STORE_CONFIG.email}. See also our{' '}
          <Link href="/contact" className={linkClass}>
            Contact page
          </Link>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Legal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
            Terms &amp; <span className="font-italic-serif text-bronze">Conditions</span>
          </h1>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-3">
                {s.title}
              </h2>
              <div className="text-mocha text-sm md:text-base leading-relaxed space-y-3">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
