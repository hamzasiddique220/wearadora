import { STORE_CONFIG } from '@/lib/constants';

export default function AnnouncementBar() {
  const messages = [
    '✦ Handcrafted with 40+ years of experience',
    '✦ Free delivery on orders Rs 3,000+',
    '✦ 7-day exchange & refund policy',
    '✦ Mega Sale — limited time',
    `✦ Order via WhatsApp · Delivery in ${STORE_CONFIG.deliveryDays}`,
    '✦ New collection arrived',
  ];

  const allMessages = [...messages, ...messages];

  return (
    <div className="bg-charcoal text-cream py-2 overflow-hidden">
      <div className="marquee text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase">
        {allMessages.map((msg, i) => (
          <span key={i} className="px-6 sm:px-8">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
