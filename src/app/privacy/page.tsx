import type { Metadata } from 'next';
import { ShieldCheck, Database, Cookie, Lock, Mail } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy | Wear Adora',
  description:
    'How Wear Adora collects, uses and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Database size={22} />,
      title: 'Information We Collect',
      body: (
        <>
          <p>
            When you place an order or contact us, we collect details you share
            with us — your name, delivery address, phone number, email and order
            preferences. We do not collect more than is needed to fulfil your
            order.
          </p>
          <p>
            We never store your credit card details on our servers. Online
            payments (where applicable) are handled by trusted third-party
            providers.
          </p>
        </>
      ),
    },
    {
      icon: <ShieldCheck size={22} />,
      title: 'How We Use Your Information',
      body: (
        <>
          <p>
            Your information is used to process orders, arrange delivery, answer
            your questions and let you know about order status. With your
            permission, we may also send you occasional updates about new
            collections or sales.
          </p>
          <p>
            We do not sell, rent or share your personal information with
            unrelated third parties.
          </p>
        </>
      ),
    },
    {
      icon: <Cookie size={22} />,
      title: 'Cookies & Browsing',
      body: (
        <>
          <p>
            Our site uses standard cookies and local storage to remember your
            cart, wishlist and preferences. These help the site work properly
            and feel responsive — they do not contain personal information.
          </p>
          <p>
            You can clear cookies and local storage from your browser at any
            time.
          </p>
        </>
      ),
    },
    {
      icon: <Lock size={22} />,
      title: 'Data Security',
      body: (
        <>
          <p>
            We use industry-standard security practices to protect the data we
            hold. Order information is stored on secured cloud infrastructure
            and accessed only by authorised team members fulfilling your order.
          </p>
          <p>
            While no online service is ever 100% secure, we work hard to keep
            your information safe.
          </p>
        </>
      ),
    },
    {
      icon: <Mail size={22} />,
      title: 'Your Choices',
      body: (
        <>
          <p>
            You can request a copy of the information we hold about you, ask us
            to update it, or request that we delete it. Reach out to{' '}
            <a
              href={`mailto:${STORE_CONFIG.email}`}
              className="text-bronze hover:text-charcoal underline underline-offset-2"
            >
              {STORE_CONFIG.email}
            </a>{' '}
            and we&rsquo;ll respond promptly.
          </p>
          <p>
            You can opt out of marketing messages at any time by replying STOP
            to a WhatsApp message or unsubscribing from email.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-14">
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Privacy Policy
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-light mt-4 mb-6">
          Your trust,{' '}
          <span className="font-italic-serif text-bronze">our promise.</span>
        </h1>
        <p className="text-lg text-mocha leading-relaxed max-w-2xl mx-auto">
          We collect only what we need to deliver your order beautifully and
          treat your information with the same care we put into our craft.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((s) => (
          <section
            key={s.title}
            className="bg-white border border-stone/70 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-bronze/10 text-bronze rounded-full flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <h2 className="font-serif text-2xl">{s.title}</h2>
            </div>
            <div className="space-y-3 text-sm md:text-base text-mocha leading-relaxed pl-0 md:pl-14">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 text-center text-xs text-mocha">
        Questions about this policy? Email{' '}
        <a
          href={`mailto:${STORE_CONFIG.email}`}
          className="text-bronze hover:text-charcoal"
        >
          {STORE_CONFIG.email}
        </a>{' '}
        · Last updated: April 2026
      </div>
    </div>
  );
}
