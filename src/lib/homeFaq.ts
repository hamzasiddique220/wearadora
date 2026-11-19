import { STORE_CONFIG, CONTACT_PHONE, DELIVERY_TEXT, DELIVERY_TIMES } from './constants';
import type { CategoryFaq } from './categories';
import type { SizeRange } from './sizeRange';

export interface HomeFaq extends CategoryFaq {
  /** Anchor id for deep-linking (#faq-cod etc.). */
  id: string;
  /**
   * true = the answer still needs real business info. These are left out of
   * both the visible FAQ and the FAQPage schema until filled in, so no
   * placeholder text ever ships and markup always matches the page.
   */
  todo?: boolean;
}

const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');

/**
 * Home page FAQ — single source for the visible section AND the FAQPage
 * JSON-LD (Google requires the two to match exactly).
 *
 * Facts come from: delivery zones → src/app/shipping/page.tsx; fee and
 * threshold → STORE_CONFIG; returns → src/app/return-policy/page.tsx;
 * payment methods + WhatsApp ordering → src/app/faq/page.tsx; 40+ years →
 * src/app/about/page.tsx. Change them there and here together.
 */
export function getHomeFaqs(
  jewelryEnabled: boolean,
  sizeRange: SizeRange | null = null
): HomeFaq[] {
  const sizes = sizeRange
    ? sizeRange.min === sizeRange.max
      ? ` (we stock size ${sizeRange.min})`
      : ` (we stock sizes ${sizeRange.min}–${sizeRange.max})`
    : '';
  const faqs: HomeFaq[] = [
    {
      id: 'faq-delivery',
      question: 'Where do you deliver, and how long does delivery take?',
      answer:
        `We deliver across Pakistan. Orders reach Karachi in ${DELIVERY_TEXT.karachi} and the rest of Pakistan in ${DELIVERY_TEXT.restOfPakistan}. With online payment, urgent delivery takes ${DELIVERY_TIMES.urgent.karachi} working day in Karachi and ${DELIVERY_TIMES.urgent.punjab} in Punjab.`,
    },
    {
      id: 'faq-cod',
      question: 'Do you offer cash on delivery?',
      answer:
        'Yes. Cash on delivery is available anywhere in Pakistan, so you pay the rider when your parcel arrives. You can also pay by bank transfer, Easypaisa or JazzCash.',
    },
    {
      id: 'faq-free-delivery',
      question: 'How much is delivery, and when is it free?',
      answer: `Delivery is free on orders of Rs ${free} and above. For smaller orders, a flat delivery charge of Rs ${STORE_CONFIG.deliveryFee} applies anywhere in Pakistan.`,
    },
    {
      id: 'faq-size',
      question: 'How do I choose the right shoe size?',
      // Range comes from the live catalog (getFootwearSizeRange).
      answer: `Our shoes use standard Pakistani/UK sizes${sizes} and fit true to size, so order your usual size. Not sure? Message us on WhatsApp at ${CONTACT_PHONE.display}, available 24/7, and we'll help you choose.`,
    },
    {
      id: 'faq-returns',
      question: 'What is your exchange and return policy?',
      answer:
        'You can request an exchange or return within 7 days of receiving your order, as long as the item is unused and in its original packaging. Earrings are exchange-only for hygiene reasons. Report damaged or wrong items within 48 hours.',
    },
    {
      id: 'faq-handcrafted',
      question: 'Are Wear Adora products handcrafted?',
      answer: jewelryEnabled
        ? 'Yes. Every pair of heels, sandals and slides is handcrafted in our Karachi workshop, backed by 40+ years of shoemaking experience, and our American diamond jewellery is handcrafted too.'
        : 'Yes. Every pair of heels, sandals and slides is handcrafted in our Karachi workshop, backed by 40+ years of shoemaking experience.',
    },
    {
      id: 'faq-whatsapp',
      question: 'How do I order on WhatsApp?',
      answer: `Tap the WhatsApp button on any page, or message us on ${CONTACT_PHONE.display} (available 24/7), to place your order directly. Orders placed through the website checkout are also confirmed with you by call or WhatsApp before they ship.`,
    },
  ];
  return faqs.filter((f) => !f.todo);
}
