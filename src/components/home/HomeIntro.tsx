import { STORE_CONFIG } from '@/lib/constants';

interface HomeIntroProps {
  jewelryEnabled: boolean;
}

/**
 * The home page's single H1 + a short "what is Wear Adora" summary. Kept out
 * of the Hero carousel so the H1 is a stable brand/category heading rather
 * than whichever featured product happens to be on the first slide.
 */
export default function HomeIntro({ jewelryEnabled }: HomeIntroProps) {
  const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');

  return (
    <section
      aria-labelledby="home-heading"
      className="px-4 sm:px-6 md:px-12 pt-6 pb-4 md:pt-10 md:pb-6 text-center"
    >
      <h1
        id="home-heading"
        className="font-serif text-2xl sm:text-3xl md:text-4xl font-light leading-tight max-w-3xl mx-auto"
      >
        {jewelryEnabled ? (
          <>
            Handcrafted Footwear &amp;{' '}
            <span className="font-italic-serif text-bronze">American Diamond Jewelry</span>{' '}
            in Pakistan
          </>
        ) : (
          <>
            Handcrafted{' '}
            <span className="font-italic-serif text-bronze">Heels, Sandals &amp; Slides</span>{' '}
            in Pakistan
          </>
        )}
      </h1>
      <p className="text-mocha text-[13px] sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-3 md:mt-4">
        {jewelryEnabled
          ? `${STORE_CONFIG.name} is a Karachi-based online store for handcrafted women's footwear and jewelry. Our heels, sandals and slides are handcrafted in Karachi with 40+ years of shoemaking behind them, alongside handcrafted American diamond jewelry. Pay cash on delivery anywhere in Pakistan, with free delivery on orders of Rs ${free} and above.`
          : `${STORE_CONFIG.name} is a Karachi-based online store for women's footwear. Our heels, sandals and slides are handcrafted in Karachi, backed by 40+ years of shoemaking, and delivered across Pakistan. Pay cash on delivery anywhere in the country, with free delivery on orders of Rs ${free} and above.`}
      </p>
    </section>
  );
}
