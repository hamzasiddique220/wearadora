import type { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Mail, MessageCircle } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy | Wear Adora',
  description:
    '7-day exchange and refund policy at Wear Adora — eligibility, how to request, refund timelines, and contact details.',
  alternates: { canonical: '/return-policy' },
  openGraph: {
    title: `Return & Exchange Policy | ${STORE_CONFIG.name}`,
    description:
      '7-day exchange and refund policy at Wear Adora — handcrafted ladies footwear & jewellery.',
    url: `${STORE_CONFIG.siteUrl}/return-policy`,
    type: 'website',
  },
};

export default function ReturnPolicyPage() {
  const whatsappLink = `https://wa.me/${STORE_CONFIG.whatsappNumber}`;
  const mailLink = `mailto:${STORE_CONFIG.email}`;

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Return Policy' }]} />
      </div>

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Return &amp; Exchange Policy
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
            Love every piece,
            <br />
            <span className="font-italic-serif text-bronze">or send it back.</span>
          </h1>
          <p className="text-mocha leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            At Wear Adora, we want you to love every piece you order. If
            something isn&rsquo;t quite right, we&rsquo;re here to help.
          </p>
        </div>

        <article className="blog-article">
          <h2>1. Return &amp; Exchange Window</h2>
          <p>
            You may request a <strong>return or exchange within 7 days</strong>{' '}
            of receiving your order. Requests made after 7 days, unfortunately,
            cannot be accepted.
          </p>

          <h2>2. Conditions for Return &amp; Exchange</h2>
          <p>To be eligible, the item must be:</p>
          <ul>
            <li><strong>Unused and unworn</strong>, in its original condition</li>
            <li>In its <strong>original packaging</strong> with all tags and inserts intact</li>
            <li>Accompanied by <strong>proof of purchase</strong> (your order number or receipt)</li>
          </ul>
          <p>
            Items that are damaged due to misuse, altered, or returned without
            original packaging may not qualify.
          </p>

          <h2>3. Non-Returnable Items</h2>
          <p>
            For hygiene reasons,{' '}
            <strong>earrings can be exchanged but not returned for a refund</strong>{' '}
            (unless they arrive damaged or faulty). All other items follow the
            standard policy above.
          </p>

          <h2>4. How to Request a Return or Exchange</h2>
          <p>It&rsquo;s simple:</p>
          <ol>
            <li>
              <strong>Contact us within 7 days</strong> of delivery on WhatsApp
              at{' '}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                {STORE_CONFIG.phoneDisplay}
              </a>{' '}
              or email{' '}
              <a href={mailLink}>{STORE_CONFIG.email}</a>.
            </li>
            <li>
              Share your <strong>order number</strong> and, for damaged or wrong
              items, a <strong>clear photo</strong>.
            </li>
            <li>
              Our team will confirm your request and guide you on how to send
              the item back.
            </li>
          </ol>
          <p>Please wait for our confirmation before sending anything back.</p>

          <h2>5. Exchanges</h2>
          <p>
            Want a different piece? We&rsquo;re happy to exchange your item for
            another of equal value, subject to availability. If your chosen
            item is out of stock, you can pick an alternative or request a
            refund. Any price difference will be settled at the time of
            exchange.
          </p>

          <h2>6. Refunds</h2>
          <p>
            Once we receive and inspect your returned item, we&rsquo;ll notify
            you and process your refund:
          </p>
          <ul>
            <li>
              <strong>Prepaid (card/online) orders:</strong> refunded to your
              original payment method.
            </li>
            <li>
              <strong>Cash on Delivery (COD) orders:</strong> refunded via{' '}
              <strong>bank transfer, Easypaisa, or JazzCash</strong> (you&rsquo;ll be asked for your account details).
            </li>
            <li>
              Refunds are typically processed within{' '}
              <strong>5–7 business days</strong> after we receive the returned
              item.
            </li>
            <li>
              Please note: <strong>delivery charges are non-refundable</strong> —
              they cover the cost of getting your order to you and are paid by
              the customer in all cases.
            </li>
          </ul>

          <h2>7. Damaged, Defective or Wrong Items</h2>
          <p>
            We&rsquo;re sorry if this happens — and we&rsquo;ll make it right.
            If your order arrives <strong>damaged, faulty, or incorrect</strong>,
            contact us within <strong>48 hours</strong> of delivery with photos.
            We will arrange a <strong>free replacement or refund of the item
            price</strong>, and <strong>Wear Adora will cover the return
            shipping</strong> in these cases. Original delivery charges remain
            non-refundable.
          </p>

          <h2>8. Return Shipping</h2>
          <p>
            For change-of-mind returns and exchanges, the{' '}
            <strong>customer is responsible for the return shipping cost</strong>.
            For damaged, defective, or wrong items,{' '}
            <strong>Wear Adora covers the shipping</strong>.
          </p>

          <h2>9. Need Help?</h2>
          <p>
            We&rsquo;re always happy to assist. Reach out and our team will
            take care of you.
          </p>
        </article>

        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-stone hover:border-bronze hover:bg-cream/40 transition-colors flex items-center gap-3 p-4 group"
          >
            <span className="w-10 h-10 rounded-full bg-bronze/10 text-bronze flex items-center justify-center shrink-0">
              <MessageCircle size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] tracking-[0.25em] uppercase text-bronze">
                WhatsApp
              </span>
              <span className="block text-charcoal font-medium truncate">
                {STORE_CONFIG.phoneDisplay}
              </span>
            </span>
          </a>
          <a
            href={mailLink}
            className="border border-stone hover:border-bronze hover:bg-cream/40 transition-colors flex items-center gap-3 p-4 group"
          >
            <span className="w-10 h-10 rounded-full bg-bronze/10 text-bronze flex items-center justify-center shrink-0">
              <Mail size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] tracking-[0.25em] uppercase text-bronze">
                Email
              </span>
              <span className="block text-charcoal font-medium truncate">
                {STORE_CONFIG.email}
              </span>
            </span>
          </a>
        </div>

        <p className="text-center text-xs sm:text-sm text-mocha/80 italic mt-10">
          Thank you for shopping with Wear Adora — adorned in artistry.
        </p>

        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-block text-xs tracking-[0.25em] uppercase border border-charcoal text-charcoal px-6 py-3 hover:bg-charcoal hover:text-cream transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
