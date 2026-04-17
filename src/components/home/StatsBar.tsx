const stats = [
  { num: '500+', label: 'Happy Customers' },
  { num: '100%', label: 'Handcrafted' },
  { num: '24/7', label: 'WhatsApp Support' },
  { num: '5★', label: 'Rated Collection' },
];

export default function StatsBar() {
  return (
    <section className="border-y border-stone bg-sand/50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-light mb-1">
              {stat.num}
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-bronze">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
