import { normalizeCategory } from './constants';

export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface CategoryDef {
  /** URL segment under /jewelry/, e.g. 'necklace'. */
  slug: string;
  /** Canonical Product.category value this page filters on, e.g. 'Necklace'. */
  category: string;
  /** Singular display label, e.g. 'Necklace'. */
  label: string;
  /** Plural display label, e.g. 'Necklaces'. */
  plural: string;
  /** Dynamic H1, e.g. 'Necklace Collection'. */
  h1: string;
  seoTitle: string;
  metaDescription: string;
  /** Invisible SEO keywords — customer-facing copy never uses these terms directly. */
  keywords: string[];
  /** One-line hero/banner blurb under the H1. */
  intro: string;
  /** 700–1000 word long-form SEO content, as paragraphs. */
  description: string[];
  faqs: CategoryFaq[];
}

export const JEWELRY_CATEGORY_DEFS: CategoryDef[] = [
  {
    slug: 'necklace',
    category: 'Necklace',
    label: 'Necklace',
    plural: 'Necklaces',
    h1: 'Necklace Collection',
    seoTitle: 'Necklace Online in Pakistan — Necklace Sets & Bridal Chokers | Wear Adora',
    metaDescription:
      'Shop artificial necklace sets and bridal choker sets online in Pakistan. Handcrafted, gold- and silver-tone finishes from Rs. 449, cash on delivery nationwide.',
    keywords: [
      'necklace online Pakistan',
      'artificial necklace set',
      'necklace set price in Pakistan',
      'bridal necklace set',
      'choker set',
      'zircon necklace set',
      'american diamond necklace',
      'wedding necklace Pakistan',
      'party wear necklace',
      'necklace set online',
    ],
    intro:
      'Statement necklace sets and bridal chokers, handcrafted in Pakistan to carry a look from morning to mehndi.',
    description: [
      'A necklace is the one piece that sets the tone for an entire outfit, and Wear Adora’s necklace collection is built around that idea. Every set is handcrafted with brilliant, high-clarity stones in a polished gold-, silver- or rose-tone finish, so it catches light the way fine jewellery does without the price tag or the worry that comes with wearing something precious. Whether you need a delicate layering piece for a dawaat or a full bridal choker set for your walima, this collection is organised so you can shop by occasion rather than scroll endlessly.',
      'Necklace sets here range from minimal pendant styles that sit close to the collarbone to elaborate choker sets with matching maang tikka and jhumkis, designed for the bigger events on the calendar — barat, walima, mehndi, engagements and Eid. The choker silhouette in particular has become the most requested bridal style in Pakistan over the last few seasons, and our sets are cut to sit comfortably against the neck for hours of wear, with adjustable dori or hook closures so one size genuinely fits most. For everyday and semi-formal wear, our longer rani-haar and single-strand styles pair easily with both eastern and western necklines.',
      'Choosing the right necklace length matters more than most people realise. A short choker (14–16 inches) works best with a high or boat neckline and draws attention upward, which is why it is the default choice for heavily embellished gharara and lehnga necklines. A mid-length necklace (18–20 inches) is the most versatile and sits just below the collarbone — ideal for kurtas, shirts and most western tops. Longer rani-haar styles (24 inches and beyond) are made for deep necklines and simple silhouettes, where the necklace itself becomes the focal point rather than competing with embroidery. If you are buying a set for a wedding function, it is worth matching the necklace length to your dupatta and neckline first, and letting the earrings follow — that order almost always looks more considered than the reverse.',
      'Layering is where this collection has the most room to play. A short choker under a longer pendant necklace is a look we see repeated across real weddings and it works because the two pieces occupy different visual zones — close to the neck and mid-chest — instead of fighting for the same space. If you are new to layering, start with two pieces in the same metal tone (all gold-tone or all silver-tone) before mixing finishes, since matching tones photograph better under mehndi and event lighting. Our bangles and earrings are designed in the same finishes as the necklace sets specifically so this kind of coordinated styling is simple rather than a guessing game.',
      'Because these are fashion pieces rather than solid gold, care is straightforward but does make a real difference to how long the finish lasts. Put jewellery on last, after perfume, hairspray and makeup, since those products are the biggest cause of tarnishing on plated metal. Take it off first when you get home, wipe each piece with a soft dry cloth, and store necklaces separately — tangled chains and stones rubbing against each other in a single box is the most common way a set gets damaged. A small silica gel sachet in your jewellery box helps in Pakistan’s humidity, especially during monsoon months.',
      'Every necklace set on this page ships from our Karachi workshop with cash on delivery available nationwide, so you can check the piece in person before paying. Delivery takes 4–5 days across Pakistan and is free on orders above Rs. 3,000, which most of our sets clear on their own. If a set doesn’t suit you once it arrives, we offer a 7-day exchange on unused pieces in their original packaging, so trying a new style for an upcoming function carries very little risk. For gifting, a necklace set is one of the easiest choices — it works across sizes, needs no fitting, and photographs well whether it’s for a birthday, an engagement or an Eidi.',
    ],
    faqs: [
      {
        question: 'What necklace styles does Wear Adora offer?',
        answer:
          'From minimal pendant necklaces and mid-length rani-haars to full bridal choker sets with matching maang tikka and jhumkis — the collection covers everyday, party and wedding wear in gold-, silver- and rose-tone finishes.',
      },
      {
        question: 'How do I pick the right necklace length for my outfit?',
        answer:
          'Short chokers (14–16") suit high or heavily embellished necklines, mid-length necklaces (18–20") are the most versatile for kurtas and shirts, and longer rani-haar styles (24"+) work best with simple, deep necklines where the necklace is the main statement.',
      },
      {
        question: 'Are these necklace sets suitable for weddings?',
        answer:
          'Yes — our choker sets with maang tikka and statement rani-haars are designed specifically for barat, walima, mehndi and engagement functions, giving full bridal shine without the cost or risk of real jewellery.',
      },
      {
        question: 'Can I layer more than one necklace at once?',
        answer:
          'Yes, layering a short choker with a longer pendant necklace in the same metal tone is a popular look. Start with matching finishes (both gold-tone or both silver-tone) before mixing, for a cleaner result.',
      },
      {
        question: 'How do I stop my necklace from tarnishing?',
        answer:
          'Put it on last (after perfume and hairspray), take it off first, wipe with a soft dry cloth after wearing, and store each set separately in a pouch or box away from moisture.',
      },
    ],
  },
  {
    slug: 'earrings',
    category: 'Earring',
    label: 'Earring',
    plural: 'Earrings',
    h1: 'Earrings Collection',
    seoTitle: 'Earrings Online in Pakistan — Jhumkas, Studs & Danglers | Wear Adora',
    metaDescription:
      'Shop artificial earrings online in Pakistan — jhumkas, studs, danglers and bridal sets from Rs. 449. Handcrafted finishes, cash on delivery nationwide.',
    keywords: [
      'earrings online Pakistan',
      'artificial earrings',
      'jhumka earrings price in Pakistan',
      'bridal earrings',
      'zircon earrings',
      'american diamond earrings',
      'party wear earrings',
      'danglers online',
      'stud earrings Pakistan',
      'earrings set online',
    ],
    intro:
      'Jhumkas, studs and statement danglers designed to frame the face — for everyday wear and full bridal events alike.',
    description: [
      'Earrings do more work than almost any other piece of jewellery, because they sit closest to the face and are visible in every photo, every video call and every mirror check before you leave the house. Wear Adora’s earring collection is built around that fact — each pair is handcrafted with brilliant, high-clarity stones set in a gold-, silver- or rose-tone finish, so they catch light without weighing the ear down. The range spans traditional jhumkas and chandbalis, minimal studs for daily wear, and long danglers for evening events, so you are not choosing between comfort and occasion.',
      'Jhumkas remain the most requested style for Pakistani weddings, and for good reason — the bell shape has enough visual weight to hold its own against heavy dupattas and gharara sets, while still swinging naturally with movement, which is what gives mehndi and dance videos their sparkle. Chandbalis, with their crescent silhouette, work particularly well against high-neck blouses and sarees, and have become a common alternative to jhumkas for walima and reception looks where a slightly more structured shape is wanted. For daily wear, our stud and small hoop styles are light enough to forget you are wearing them, and are designed to hold up to a full day at work or university without losing shine.',
      'Choosing between studs, danglers and jhumkas is mostly about face shape and hair styling rather than the outfit alone. If your hair is worn open, a smaller stud or short dangler keeps the earring visible without getting lost in your hair, while jhumkas and chandbalis are made to be seen with hair pulled back or worn in a bun — which is exactly how most bridal and semi-formal hairstyles are done in Pakistan. Longer danglers elongate a rounder face, while studs and closer-set jhumkas suit a longer face better by adding width rather than length. If you are unsure, a mid-length jhumka is the safest all-round choice and is what we’d recommend as a first bridal-adjacent pair.',
      'Earrings have one care consideration that necklaces and bangles don’t: they sit directly against pierced skin, so hygiene matters more here than anywhere else in the collection. We recommend wiping the post and back of each earring with a clean, dry cloth or a cotton pad lightly dampened with rubbing alcohol before first wear, and avoiding earrings on broken or irritated skin. For this reason, and in line with standard practice across Pakistan, earrings can be exchanged for a different style within 7 days but are not eligible for a cash refund unless they arrive damaged or defective — a policy that protects both you and future customers.',
      'Pairing earrings with the rest of an outfit is simplest when you decide on one focal point. If you’re wearing a statement necklace or choker, a smaller stud or short dangler in the same metal tone keeps the look balanced instead of competitive. If the neckline is bare or the outfit has no necklace, that’s exactly when a bigger jhumka or chandbali earns its place as the single statement piece. Our earring finishes are matched to our necklace and bangle sets in gold-, silver- and rose-tone specifically so building a coordinated look — or deliberately choosing to let the earrings stand alone — is a straightforward decision rather than a mismatch risk.',
      'Every pair ships from our Karachi workshop with cash on delivery available across Pakistan, arriving in 4–5 days with free delivery on orders above Rs. 3,000. Earrings are one of the easiest gifts to get right — there’s no sizing to guess, they suit almost any face shape in the right style, and a good pair gets worn far more often than most other jewellery in a wardrobe. Whether you’re shopping for a wedding season full of functions or one everyday pair that goes with everything, this collection is organised so the right style is easy to find.',
    ],
    faqs: [
      {
        question: 'What types of earrings does Wear Adora sell?',
        answer:
          'Jhumkas, chandbalis, studs, hoops and long danglers — covering everyday wear through to full bridal looks, all in gold-, silver- and rose-tone finishes.',
      },
      {
        question: 'Which earring style suits my face shape?',
        answer:
          'Longer danglers tend to flatter rounder faces by adding length, while studs and closer-set jhumkas suit longer faces by adding width. A mid-length jhumka is the safest all-round choice if you’re unsure.',
      },
      {
        question: 'Can I exchange or return earrings?',
        answer:
          'Earrings can be exchanged for a different style within 7 days of delivery. For hygiene reasons, they are not eligible for a cash refund unless they arrive damaged or defective.',
      },
      {
        question: 'Are jhumkas suitable for everyday wear or only weddings?',
        answer:
          'Smaller and lightweight jhumkas work well for everyday and office wear, while larger, more embellished jhumkas are better suited to weddings, mehndis and formal events.',
      },
      {
        question: 'How should I clean new earrings before wearing them?',
        answer:
          'Wipe the post and back gently with a dry cloth or a cotton pad lightly dampened with rubbing alcohol before first wear, and avoid wearing on broken or irritated skin.',
      },
    ],
  },
  {
    slug: 'rings',
    category: 'Ring',
    label: 'Ring',
    plural: 'Rings',
    h1: 'Rings Collection',
    seoTitle: 'Rings Online in Pakistan — Cocktail & Stacking Rings | Wear Adora',
    metaDescription:
      'Shop artificial rings online in Pakistan — cocktail, stacking and adjustable rings from Rs. 449. Handcrafted finishes, cash on delivery nationwide.',
    keywords: [
      'rings online Pakistan',
      'artificial rings',
      'cocktail ring price in Pakistan',
      'adjustable ring',
      'zircon ring',
      'american diamond ring',
      'stacking rings',
      'party wear ring',
      'ring set online',
      'statement ring Pakistan',
    ],
    intro:
      'Cocktail rings, stacking bands and adjustable statement pieces — sized to fit and finished to shine.',
    description: [
      'A ring is a small piece of jewellery with an outsized effect — it’s visible in almost every hand gesture, every photo where you’re holding a chai cup or a phone, and every close-up during a mehndi. Wear Adora’s ring collection is designed around that visibility, with cocktail rings, adjustable bands and stacking sets handcrafted in gold-, silver- and rose-tone finishes set with brilliant, high-clarity stones. The range covers everything from a single statement piece for an event to sets of slim bands meant to be worn together.',
      'Cocktail rings are the centrepiece of the collection — large, sculptural designs meant to be noticed, worn on the index or middle finger where they catch the most light. These are the pieces we see picked most often for walimas, engagements and formal dinners, where one striking ring can finish a look without needing a full jewellery set. Stacking rings work in the opposite direction: slim, simple bands sold as sets of two or three, designed to be worn together across one or two fingers, or split up and worn individually for everyday styling. Both approaches solve a different problem, and this collection is organised so you can shop for either without the two competing for attention on the same page.',
      'Sizing is the question we’re asked most often about rings, and it’s also the reason most of our designs are made adjustable. An open-back or spring-adjustable band typically fits ring sizes 6 through 9 (roughly a 16–19mm inner diameter), which covers the vast majority of adult hands. If a listing is adjustable, you can gently open or close the band to get a snug fit — do this slowly and evenly around the whole band rather than bending one section, which keeps the ring round instead of oval. For fixed-size cocktail rings, we list the size range on the product page; if you’re between sizes, sizing up slightly is usually more comfortable than sizing down, since rings tend to feel tighter after a few hours of wear in hot weather.',
      'Stacking is where rings get genuinely fun to style. The simplest combination is two or three slim bands in the same metal tone worn on adjacent fingers, which reads as intentional rather than cluttered. A slightly more advanced look mixes one textured or gem-set band with plain polished bands on either side — the plain bands act as a frame for the detailed one. If you’re wearing a cocktail ring as your statement piece, keep the other hand simple or bare; two competing statement rings on two hands tends to split attention rather than double the impact.',
      'Because rings sit against skin all day and go through more friction than most jewellery — handwashing, cooking, typing — their finish needs slightly more attention to stay bright. Remove rings before washing dishes, applying lotion or using hand sanitiser, since these are the most common causes of a plated finish wearing thin. Store rings flat in a lined box rather than loose in a pouch, where stones can knock against harder pieces like bangles. Wiped clean with a soft dry cloth after each wear, a good gold- or silver-tone ring holds its shine for a long time.',
      'All rings ship from our Karachi workshop with cash on delivery available nationwide, arriving in 4–5 days with free delivery on orders above Rs. 3,000. If a ring doesn’t fit quite right or isn’t what you expected once it arrives, we offer a 7-day exchange on unused pieces in original packaging — useful given that sizing is the one thing a photo online can’t fully convey. Rings also make an easy, low-risk gift: adjustable styles remove the guesswork around size, and a well-chosen cocktail ring reads as considered without needing to know the recipient’s exact taste in jewellery.',
    ],
    faqs: [
      {
        question: 'What ring styles are available at Wear Adora?',
        answer:
          'Statement cocktail rings for events, and slim stacking bands sold individually or as sets — all in gold-, silver- and rose-tone finishes with high-clarity stones.',
      },
      {
        question: 'How do adjustable rings work if I don’t know my size?',
        answer:
          'Most of our rings use an open-back adjustable band that fits sizes 6–9 (roughly 16–19mm inner diameter). Gently and evenly open or close the band around its full circumference for a snug fit.',
      },
      {
        question: 'Can I wear multiple rings together?',
        answer:
          'Yes — stacking two or three slim bands in the same metal tone on adjacent fingers is a popular, easy look. If wearing a large cocktail ring as a statement piece, keep the other hand simpler.',
      },
      {
        question: 'How do I keep my ring from losing its shine?',
        answer:
          'Remove rings before handwashing dishes, applying lotion or using hand sanitiser, and store them flat in a lined box rather than loose with harder pieces like bangles.',
      },
      {
        question: 'Can I exchange a ring if the size isn’t right?',
        answer:
          'Yes, we offer a 7-day exchange on unused rings in their original packaging, which covers cases where the fit isn’t quite right once the piece arrives.',
      },
    ],
  },
  {
    slug: 'bangles',
    category: 'Bangles',
    label: 'Bangles',
    plural: 'Bangles',
    h1: 'Bangles & Bracelets Collection',
    seoTitle: 'Bangles & Bracelets Online in Pakistan | Wear Adora',
    metaDescription:
      'Shop artificial bangles and bracelets online in Pakistan — stacking sets and statement cuffs from Rs. 449. Handcrafted finishes, cash on delivery nationwide.',
    keywords: [
      'bangles online Pakistan',
      'bracelets online Pakistan',
      'artificial bangles',
      'bangles set price in Pakistan',
      'zircon bracelet',
      'american diamond bangles',
      'wedding bangles set',
      'stacking bangles',
      'cuff bracelet Pakistan',
      'bangles set online',
    ],
    intro:
      'Stacking bangle sets and statement bracelets, handcrafted to layer beautifully from wrist to elbow.',
    description: [
      'Bangles and bracelets are the same piece of jewellery known by two names in Pakistan — “bangles” in Urdu-inflected everyday speech, “bracelets” in more formal or western contexts — and this collection covers both under one roof. Wear Adora’s bangle and bracelet sets are handcrafted with brilliant, high-clarity stones in gold-, silver- and rose-tone finishes, ranging from delicate single cuffs for daily wear to full stacking sets designed for weddings and festive dressing, where multiple bangles worn together create the sound and movement that makes an outfit feel complete.',
      'The stacking set is the most-requested format in this collection, and it is built around a simple styling principle: bangles look better in odd numbers and in groups rather than as single pieces, worn from the wrist upward. A typical bridal stack might combine 6–8 slim bangles in one metal tone with one or two thicker statement pieces mixed in, worn on one arm while the other stays bare or wears just a single cuff — a balance that reads as deliberate rather than cluttered. For daily wear, a single slim bangle or a delicate chain bracelet does the same job with far less visual weight, and is designed to be worn all day at work, university or around the house without catching on sleeves.',
      'Sizing bangles correctly is the single biggest factor in how comfortable they are to wear, and it comes down to measuring your hand at its widest point — typically across the knuckles, since a bangle has to pass over this point to reach the wrist. Measure with a soft tape or a strip of paper around the widest part of your hand with fingers together and thumb tucked in, then compare to the size chart on each product page. As a rough guide, most adult women in Pakistan fall into a 2.4–2.6 inch inner diameter range. If you’re between two sizes, size up — a bangle that’s slightly loose is far more comfortable and far less likely to crack than one forced over the hand.',
      'Bracelets with clasps (as opposed to rigid bangles) solve the sizing question differently, since most of ours come with an adjustable chain extension of an inch or two, letting you fit the same piece to a slightly smaller or larger wrist without needing an exact measurement in advance. These clasp styles tend to suit western outfits and everyday layering better than rigid bangles, since they can be added or removed one-handed and don’t require sliding over the whole hand.',
      'Because bangles are worn on the most active part of the arm, they take more daily impact than almost any other jewellery category — door frames, desks, car doors. Rigid bangles in particular can crack if dropped on a hard floor, so we’d suggest removing stacked sets before intensive housework or exercise, and storing them upright in a bangle stand or laid flat rather than piled loosely in a drawer, where the stones can chip against each other. A soft cloth wipe after each wear keeps the gold- or silver-tone finish from dulling.',
      'Every bangle and bracelet set ships from our Karachi workshop with cash on delivery available nationwide, arriving in 4–5 days with free delivery on orders above Rs. 3,000. If a size doesn’t sit right once it arrives, we offer a 7-day exchange on unused pieces in their original packaging — particularly useful here given how much fit depends on individual hand size. For wedding season shopping, this is usually the first category to plan, since a full bridal stack takes the most time to put together and pairs directly with the necklace and earring sets in the same finish.',
    ],
    faqs: [
      {
        question: 'What’s the difference between bangles and bracelets at Wear Adora?',
        answer:
          'They’re the same category of jewellery under two common names. This page includes rigid stacking bangles and clasp bracelets together — both handcrafted in gold-, silver- and rose-tone finishes.',
      },
      {
        question: 'How do I measure my wrist for the right bangle size?',
        answer:
          'Measure around the widest part of your hand (across the knuckles, fingers together, thumb tucked in) since a bangle must pass over this point. Most adult women in Pakistan fall in the 2.4–2.6 inch inner-diameter range — size up if you’re between sizes.',
      },
      {
        question: 'How many bangles should I wear together for a bridal look?',
        answer:
          'A common bridal stack is 6–8 slim bangles in one metal tone plus one or two thicker statement pieces, worn on one arm, with the other arm left bare or wearing a single cuff.',
      },
      {
        question: 'Do your bracelets have adjustable sizing?',
        answer:
          'Most clasp-style bracelets include an adjustable chain extension of an inch or two, so they fit a small range of wrist sizes without needing an exact measurement in advance.',
      },
      {
        question: 'How do I stop bangles from cracking or losing shine?',
        answer:
          'Remove stacked bangles before housework or exercise, store them upright in a bangle stand or laid flat rather than piled loosely, and wipe with a soft dry cloth after each wear.',
      },
    ],
  },
  {
    slug: 'anklets',
    category: 'Anklet',
    label: 'Anklet',
    plural: 'Anklets',
    h1: 'Anklets Collection',
    seoTitle: 'Anklets Online in Pakistan — Payal & Anklet Chains | Wear Adora',
    metaDescription:
      'Shop artificial anklets and payal online in Pakistan — chain, ghungroo and layered styles from Rs. 449. Handcrafted finishes, cash on delivery nationwide.',
    keywords: [
      'anklets online Pakistan',
      'payal price in Pakistan',
      'artificial anklet',
      'ghungroo payal',
      'zircon anklet',
      'american diamond anklet',
      'bridal payal',
      'anklet chain online',
      'layered anklet',
      'anklet set online',
    ],
    intro:
      'Payal, chain anklets and layered sets, finished to catch the light with every step.',
    description: [
      'The anklet, or payal, is one of the oldest styles of jewellery still worn in South Asia, and it remains one of the few pieces that’s visible in motion rather than at rest — you notice an anklet when someone walks, not just when they stand still. Wear Adora’s anklet collection is handcrafted in gold-, silver- and rose-tone finishes, ranging from fine everyday chains to layered, ghungroo-detailed payal sets made for mehndis and festive wear, where the small bells add sound as well as sparkle to every step.',
      'Traditional ghungroo payal, with its row of tiny bells along a chain, is the most requested style for mehndi and dholki functions, largely because it’s designed to be seen and heard on a dance floor. Simpler chain anklets, without bells, work better for everyday wear and for outfits where you want the detail without the sound — office wear, university, or daily errands where a quieter piece is more practical. Layered anklets, with two or three chains of slightly different lengths worn together, sit between the two: dressier than a single chain, but without the full ghungroo statement, and have become popular for engagement and walima looks paired with open-toe heels or sandals.',
      'Anklets are almost always designed to be adjustable, since ankle size varies more than most people expect and a fixed-length chain either won’t close or will hang loose. Our chain styles use an extender of an inch or two so the same piece fits a slightly narrower or wider ankle, and the right fit is one where the anklet sits just below the ankle bone with enough give to move naturally when you walk — not so tight that it presses into the skin when you sit, and not so loose that it slides down over the foot. If you’re buying a pair (most anklets are sold individually or in pairs, depending on the style), it’s worth checking the listing, since a single statement anklet on one ankle is also a common and deliberate styling choice, not a mismatch.',
      'Styling an anklet depends heavily on footwear. Barefoot or with simple sandals — the anklet is the main detail on the foot and can be layered or bell-detailed without competing with anything else. With closed shoes or boots, an anklet mostly disappears, so it’s better suited to occasions where feet are visible — mehndis, beach or pool events, and any function with open footwear. For bridal wear specifically, a payal is traditionally worn from the walima onward in many Pakistani households, paired with the same gold- or silver-tone finish as the rest of the jewellery set, which is why our anklets are made to match the metal tones used across our necklace, earring and bangle collections.',
      'Because anklets sit low and pick up more dust, sweat and friction from footwear than almost any other jewellery category, they benefit from being wiped down more often than a necklace or ring would need. A soft dry cloth after each wear, combined with removing the anklet before swimming or heavy exercise, keeps the plated finish from dulling quickly. Store anklets flat rather than balled up in a pouch, since the fine chain links used in most designs can kink or tangle if compressed for long periods.',
      'Every anklet ships from our Karachi workshop with cash on delivery available nationwide, arriving in 4–5 days with free delivery on orders above Rs. 3,000. If the length doesn’t sit quite right once it arrives, we offer a 7-day exchange on unused pieces in their original packaging. Anklets are also one of the more affordable ways to complete a festive look — a single ghungroo payal can lift an otherwise simple outfit for mehndi season without the cost of a full jewellery set.',
    ],
    faqs: [
      {
        question: 'What anklet styles does Wear Adora offer?',
        answer:
          'Traditional ghungroo (bell) payal, simple chain anklets for everyday wear, and layered multi-chain sets — all handcrafted in gold-, silver- and rose-tone finishes.',
      },
      {
        question: 'Are anklets sold as a single piece or a pair?',
        answer:
          'It depends on the style — check the individual product listing. Wearing a single statement anklet on one ankle is also a common, deliberate styling choice.',
      },
      {
        question: 'How do I get the right fit for an anklet?',
        answer:
          'Most of our anklets use a chain extender of an inch or two. The anklet should sit just below the ankle bone with enough give to move naturally when walking, without pressing into the skin when seated.',
      },
      {
        question: 'Are anklets suitable for weddings and mehndis?',
        answer:
          'Yes — ghungroo payal in particular are designed for mehndi and dholki functions, and are traditionally worn from the walima onward in many Pakistani households, matched to the rest of the bridal jewellery set.',
      },
      {
        question: 'How do I care for an anklet so it stays bright?',
        answer:
          'Wipe with a soft dry cloth after each wear, remove before swimming or exercise, and store flat rather than balled up, since fine chain links can kink if compressed for long periods.',
      },
    ],
  },
  {
    slug: 'bridal',
    category: 'Bridal',
    label: 'Bridal',
    plural: 'Bridal Sets',
    h1: 'Bridal Jewellery Collection',
    seoTitle: 'Bridal Jewellery Online in Pakistan — Bridal Sets & Choker Sets | Wear Adora',
    metaDescription:
      'Shop bridal jewellery sets online in Pakistan — matching choker, earrings and maang tikka sets for barat, walima and mehndi. Handcrafted, cash on delivery nationwide.',
    keywords: [
      'bridal jewellery online Pakistan',
      'bridal set price in Pakistan',
      'wedding jewellery set Pakistan',
      'barat jewellery set',
      'walima jewellery set',
      'dulhan jewellery set',
      'zircon bridal set',
      'american diamond bridal set',
      'choker set with maang tikka',
      'mehndi jewellery set',
    ],
    intro:
      'Complete, matching bridal sets — choker, earrings and maang tikka handcrafted together for barat, walima and every function in between.',
    description: [
      'A bridal set solves a different problem than buying jewellery piece by piece: instead of matching a necklace, earrings and maang tikka separately and hoping the metal tones and stone sizes agree, every piece in a Wear Adora bridal set is designed and handcrafted together from the start. Each set is built around a choker or rani-haar necklace in a gold-, silver- or rose-tone finish, paired with matching earrings and, in most sets, a maang tikka — so the whole look is decided in one purchase rather than three or four separate ones.',
      'Pakistani weddings run across several distinct functions, and this collection is organised around that calendar rather than around single product types. Mehndi and dholki call for bold, colourful stacks — sets with warmer stone tones and heavier bangles that hold up under bright lights and constant movement. Barat and nikkah are where the most elaborate sets belong, typically a full choker with maang tikka and jhumki earrings, worn with the heaviest outfit of the week. Walima and reception tend toward a slightly lighter, more polished set — often a rani-haar or a more structured choker without quite as much drape — since the outfit itself is usually more tailored. Buying by function first, rather than by piece, is the fastest way to narrow down a set from this page.',
      'Matching a set to your outfit comes down to three things: neckline, dupatta, and the base colour of your embroidery. A high or heavily embellished neckline pairs best with a choker set, since the shorter length sits above the busiest part of the outfit instead of competing with it. A deep or simple neckline has room for a longer rani-haar to become the statement piece on its own. For colour, gold-tone sets work with warm-toned outfits (reds, maroons, golds, oranges), while silver- and rose-tone sets sit better against cooler or pastel palettes (blues, greens, dusty pinks) — though brides increasingly mix gold-tone jewellery with any outfit colour for a more traditional bridal look, and that combination works just as well.',
      'Every bridal set here is built to be worn as-is, but also to be broken apart and restyled afterward — the earrings work on their own for a later mehndi or a friend’s wedding, the choker can be layered under a plainer necklace for a dawaat, and the maang tikka doubles as a hair accessory for other festive occasions. This is worth keeping in mind when choosing a set: the more versatile pieces (studs-adjacent earrings, a mid-weight choker) tend to get more wear after the wedding season than the most elaborate, single-occasion designs.',
      'Because a full set carries more weight and more points of contact with hair, skin and outfit fabric than any single piece, a little extra care goes a long way across a wedding week. Put the set on last — after hair, makeup and perfume — and take it off first when the function ends, since hairspray and perfume are the fastest way to dull a gold- or silver-tone finish. Store each set together in its original box between functions rather than mixing pieces into a general jewellery drawer, both to keep the set matched for next time and to stop stones from knocking against harder pieces like bangles.',
      'Every bridal set ships from our Karachi workshop with cash on delivery available nationwide, arriving in 4–5 days with free delivery on orders above Rs. 3,000 — which every set here comfortably clears. Given how central these pieces are to a single day, we’d suggest ordering at least a week ahead of the function so there’s time for a 7-day exchange if the tone or size needs adjusting once it arrives in hand rather than on a screen. If you’re piecing together several functions at once, our necklace, earring, bangle and anklet collections are all made in the same finishes as these sets, so anything you add later still matches.',
    ],
    faqs: [
      {
        question: 'What’s included in a Wear Adora bridal set?',
        answer:
          'Most bridal sets include a matching choker or rani-haar necklace and earrings, with a maang tikka included in most designs — check each product listing for the exact pieces included in that set.',
      },
      {
        question: 'How do I choose the right bridal set for my outfit?',
        answer:
          'Match neckline first (choker for high/embellished necklines, rani-haar for deep or simple ones), then metal tone to your outfit colour — gold-tone for warm reds/maroons/golds, silver- or rose-tone for cooler or pastel palettes.',
      },
      {
        question: 'Can I wear a bridal set for more than one wedding function?',
        answer:
          'Yes — many brides choose a bolder set for barat or nikkah and a lighter one for walima, and pieces from any set can be worn individually afterward for mehndis, dawaats or other events.',
      },
      {
        question: 'How far in advance should I order a bridal set?',
        answer:
          'We recommend at least a week before the function, so there’s time to use the 7-day exchange window if the tone or fit needs adjusting once the set arrives.',
      },
      {
        question: 'Can I exchange a bridal set if it doesn’t match my outfit?',
        answer:
          'Yes, unused bridal sets in their original packaging can be exchanged within 7 days of delivery — useful since colour and tone can look different on screen versus in person.',
      },
    ],
  },
];

export const JEWELRY_CATEGORY_SLUGS: string[] = JEWELRY_CATEGORY_DEFS.map(
  (d) => d.slug
);

export function getCategoryDef(slug: string): CategoryDef | undefined {
  return JEWELRY_CATEGORY_DEFS.find((d) => d.slug === slug.toLowerCase());
}

/**
 * Resolve a Product.category value (or alias, e.g. "bracelet") to its
 * canonical /jewelry/[slug] URL. "Bangles"/"Bracelets" share one page — see
 * getCategoryDef('bangles') — so this never returns a /jewelry/bracelets
 * link even though that path exists as a redirect.
 */
export function jewelryCategoryHref(categoryName?: string): string {
  const normalized = normalizeCategory(categoryName);
  const def = JEWELRY_CATEGORY_DEFS.find((d) => d.category === normalized);
  return def ? `/jewelry/${def.slug}` : '/jewelry';
}

/** Other category pages to cross-link from a given category page, in a stable order. */
export function relatedCategoryDefs(slug: string): CategoryDef[] {
  return JEWELRY_CATEGORY_DEFS.filter((d) => d.slug !== slug);
}
