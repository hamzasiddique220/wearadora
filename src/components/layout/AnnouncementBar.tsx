export default function AnnouncementBar() {
  const messages = [
    '✦ Handcrafted with love',
    '✦ Free delivery above Rs. 5,000',
    '✦ Order via WhatsApp',
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
