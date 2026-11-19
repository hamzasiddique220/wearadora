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
  // No-break space keeps "Rs 4,500" together (never a lone "4,500." line).
  const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');
  const freeRs = `Rs\u00A0${free}`;

  return (
    <section
      aria-labelledby="home-heading"
      className="px-4 sm:px-6 md:px-12 pt-6 pb-4 md:pt-10 md:pb-6 text-center"
    >
      <h1
        id="home-heading"
        // text-balance evens out the lines (no single orphan word). Fallback
        // for browsers without text-wrap: balance: the last two words are
        // joined with a no-break space, so the shortest possible last line is
        // "in Pakistan", never a lone "Pakistan".
        className="font-serif text-2xl sm:text-3xl md:text-4xl font-light leading-tight max-w-3xl mx-auto text-balance"
      >
        {jewelryEnabled ? (
          <>
            Handcrafted Footwear &amp;{' '}
            <span className="font-italic-serif text-bronze">American Diamond Jewellery</span>{' '}
            in{'\u00A0'}Pakistan
          </>
        ) : (
          <>
            Handcrafted{' '}
            <span className="font-italic-serif text-bronze">Heels, Sandals &amp; Slides</span>{' '}
            in{'\u00A0'}Pakistan
          </>
        )}
      </h1>
      <p className="text-mocha text-[13px] sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-3 md:mt-4 text-pretty">
        {jewelryEnabled
          ? `${STORE_CONFIG.name} is an online store for handcrafted heels, sandals and slides, made in our Karachi workshop with 40+ years of shoemaking experience, and handcrafted American diamond jewellery. Pay cash on delivery nationwide, with free delivery on orders from ${freeRs}.`
          : `${STORE_CONFIG.name} is an online store for handcrafted heels, sandals and slides, made in our Karachi workshop with 40+ years of shoemaking experience and delivered across Pakistan. Pay cash on delivery nationwide, with free delivery on orders from ${freeRs}.`}
      </p>
    </section>
  );
}
