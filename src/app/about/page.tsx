import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | WEARADORA',
  description: 'Learn about our story, craftsmanship, and commitment to elegance.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Handcrafted',
      desc: 'Every piece made by skilled artisans with attention to detail.',
    },
    {
      title: 'Authentic',
      desc: 'Genuine materials and traditional techniques preserved.',
    },
    {
      title: 'Timeless',
      desc: 'Designs that transcend trends and last generations.',
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20 text-center">
      <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
        ✦ About Us
      </span>
      <h1 className="font-serif text-4xl md:text-6xl font-light mt-4 mb-8">
        Where every piece tells a{' '}
        <span className="font-italic-serif text-bronze">story</span>
      </h1>
      <p className="text-lg text-mocha leading-relaxed mb-6">
        WEARADORA was born from a simple belief — that true elegance lies in
        authenticity. Every piece in our collection is thoughtfully curated and
        handcrafted by skilled artisans who have honed their craft over generations.
      </p>
      <p className="text-lg text-mocha leading-relaxed mb-12">
        From the delicate shimmer of our jewelry to the comfortable grace of our
        footwear, each creation reflects a commitment to quality, tradition, and
        timeless beauty.
      </p>

      <div className="grid md:grid-cols-3 gap-8 text-left">
        {values.map((v, i) => (
          <div key={i} className="border-t-2 border-bronze pt-6">
            <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
            <p className="text-sm text-mocha leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
