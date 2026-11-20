import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { STORE_CONFIG, CONTACT_PHONE, WHATSAPP_PHONE } from '@/lib/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${STORE_CONFIG.name} by call on ${CONTACT_PHONE.display} or WhatsApp on ${WHATSAPP_PHONE.display}, available 24/7, or email ${STORE_CONFIG.email}. Online store based in Karachi, delivering across Pakistan.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const items = [
    {
      icon: <MessageCircle size={20} />,
      label: 'WhatsApp',
      value: `${WHATSAPP_PHONE.display} (${WHATSAPP_PHONE.international})`,
      href: `https://wa.me/${WHATSAPP_PHONE.digits}`,
      external: true,
    },
    {
      icon: <Phone size={20} />,
      label: 'Phone',
      value: `${CONTACT_PHONE.display} (${CONTACT_PHONE.international})`,
      href: `tel:${CONTACT_PHONE.e164}`,
    },
    {
      icon: <Mail size={20} />,
      label: 'Email',
      value: STORE_CONFIG.email,
      href: `mailto:${STORE_CONFIG.email}`,
    },
    {
      icon: <MapPin size={20} />,
      label: 'Location',
      value: `${STORE_CONFIG.location} (online store)`,
    },
  ];

  return (
    <>
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-1">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Get in Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-3 mb-4">
            Contact <span className="font-italic-serif text-bronze">{STORE_CONFIG.name}</span>
          </h1>
          <p className="text-mocha leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
            Questions about an order, sizing or delivery?{' '}
            <strong className="text-charcoal">{CONTACT_PHONE.availability}</strong>.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <li
              key={item.label}
              className="border border-charcoal/10 rounded-md p-5 md:p-6 bg-cream/40 flex items-start gap-4"
            >
              <span className="text-bronze mt-0.5">{item.icon}</span>
              <div>
                <h2 className="text-xs tracking-[0.25em] uppercase text-mocha mb-1">
                  {item.label}
                </h2>
                {item.href ? (
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="font-serif text-lg text-charcoal hover:text-bronze"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-serif text-lg text-charcoal">{item.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p className="text-center text-mocha text-sm mt-10">
          Looking for delivery or return details? See{' '}
          <Link href="/shipping" className="text-bronze underline underline-offset-4">
            Shipping
          </Link>
          ,{' '}
          <Link href="/return-policy" className="text-bronze underline underline-offset-4">
            Return Policy
          </Link>{' '}
          or our{' '}
          <Link href="/faq" className="text-bronze underline underline-offset-4">
            FAQs
          </Link>
          .
        </p>
      </div>
    </>
  );
}
