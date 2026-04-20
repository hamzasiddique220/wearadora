export default function AnnouncementBar() {
  const messages = [
    '✦ Handcrafted with 40+ years of experience',
    '✦ Free delivery on 2 or more items',
    '✦ Mega Sale — limited time',
    '✦ Order via WhatsApp · Delivery in 2–3 days',
    '✦ New collection arrived',
  ];

  const allMessages = [...messages, ...messages];

  return (
    <div className="bg-charcoal text-cream py-2 overflow-hidden">
      <div className="marquee text-xs tracking-[0.3em] uppercase">
        {allMessages.map((msg, i) => (
          <span key={i} className="px-8">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
