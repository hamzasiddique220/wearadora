import type { SiteSettings, HeroSlideOverride } from '@/types';

export const JEWELRY_BG =
  'linear-gradient(135deg, #1a1614 0%, #2a2320 100%)';
export const SHOE_BG_LIGHT =
  'linear-gradient(135deg, #f5f1ea 0%, #e8ddc7 100%)';
export const SHOE_BG_WARM =
  'linear-gradient(135deg, #efe6d5 0%, #d6c7b0 100%)';

export const DEFAULT_HERO_SLIDES: HeroSlideOverride[] = [
  {
    image: '/images/main-WA-1-black-card-img.png',
    bg: SHOE_BG_LIGHT,
    eyebrow: '✦ New Arrivals',
    title: 'Step into',
    italic: 'elegance',
    tail: 'redefined',
    description:
      'Discover our signature embellished slides — where contemporary design meets timeless sparkle. Crafted for the woman who makes every moment her own.',
    primaryLabel: 'Shop Now',
    primaryHref: '/shoes',
    secondaryLabel: 'View All',
    secondaryHref: '/shop',
    kind: 'shoe',
  },
  {
    image:
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200&q=85',
    bg: JEWELRY_BG,
    eyebrow: '✦ Heritage Jewellery',
    title: 'Adorned in',
    italic: 'artistry',
    tail: 'everyday',
    description:
      'Handcrafted necklaces inspired by heirloom silhouettes — pieces that move with you from morning rituals to midnight moments.',
    primaryLabel: 'Shop Jewellery',
    primaryHref: '/jewelry',
    secondaryLabel: 'Necklaces',
    secondaryHref: '/jewelry/necklace',
    kind: 'jewel',
  },
  {
    image: '/images/remove.photos-removed-background-7.png',
    bg: SHOE_BG_WARM,
    eyebrow: '✦ Luxury Collection',
    title: 'Golden',
    italic: 'luxury',
    tail: 'for every stride',
    description:
      'Shimmering golden bow heels for unforgettable occasions. Every detail handcrafted to make you shine — perfect for weddings, festivities, and defining moments.',
    primaryLabel: 'Shop Heels',
    primaryHref: '/shoes/heels',
    secondaryLabel: 'Bestsellers',
    secondaryHref: '/shoes',
    kind: 'shoe',
  },
  {
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85',
    bg: 'linear-gradient(135deg, #efe6d5 0%, #c9b090 100%)',
    eyebrow: '✦ Statement Earrings',
    title: 'A pair that',
    italic: 'lingers',
    tail: 'in memory',
    description:
      'Sculpted earrings catching candlelight at every turn. Designed to frame your face with unmistakable softness.',
    primaryLabel: 'Shop Earrings',
    primaryHref: '/jewelry/earrings',
    secondaryLabel: 'View Jewellery',
    secondaryHref: '/jewelry',
    kind: 'jewel',
  },
  {
    image: '/images/remove.photos-removed-background-12.png',
    bg: 'linear-gradient(135deg, #f5f1ea 0%, #ede4d3 100%)',
    eyebrow: '✦ Signature Slides',
    title: 'Subtle',
    italic: 'grace',
    tail: 'in every detail',
    description:
      'Elegant nude bow slides — refined minimalism with a touch of glamour. Designed for comfort that never compromises on sophistication.',
    primaryLabel: 'Shop Slides',
    primaryHref: '/shoes/slides',
    secondaryLabel: 'View Jewellery',
    secondaryHref: '/jewelry',
    kind: 'shoe',
  },
  {
    image: '/images/remove.photos-removed-background-9.png',
    bg: 'linear-gradient(135deg, #f5ede0 0%, #e2d0b4 100%)',
    eyebrow: '✦ New Season',
    title: 'Walk in',
    italic: 'light',
    tail: 'and lustre',
    description:
      'Shimmering sandals for the season ahead — weightless comfort, unmistakable polish, and a finish that catches every eye.',
    primaryLabel: 'Shop Sandals',
    primaryHref: '/shoes/sandals',
    secondaryLabel: 'View All',
    secondaryHref: '/shop',
    kind: 'shoe',
  },
];

export const DEFAULT_STORY_IMAGE =
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800';

export const DEFAULT_JEWELRY_HERO = {
  image:
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=85',
  kind: 'photo' as const,
};

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Slides: '/images/aw-1-slide.jpeg',
  Heels: '/images/main-WA-1-black-card-img.png',
  Sandal: '/images/as-01.jpeg',
  Necklace: '/images/necklace-01-blk.jpg',
  Ring: '/images/ring-bangle1.jpeg',
  Earring: '/images/ring-01.jpeg',
  Bangles: '/images/bangles-01.jpeg',
  // No dedicated anklet photo shot yet — falls back to the general jewellery
  // hero image until one is uploaded via admin settings.
  Anklet: DEFAULT_JEWELRY_HERO.image,
  // No dedicated bridal-set photo yet — the necklace shot is the closest
  // visual match (chokers are the centrepiece of most bridal sets).
  Bridal: '/images/necklace-01-blk.jpg',
};

export const DEFAULT_SLIPPERS_HERO = {
  image: '/images/remove.photos-removed-background-7.png',
  kind: 'product' as const,
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroSlides: DEFAULT_HERO_SLIDES,
  categoryImages: DEFAULT_CATEGORY_IMAGES,
  storyImage: DEFAULT_STORY_IMAGE,
  jewelryHero: DEFAULT_JEWELRY_HERO,
  slippersHero: DEFAULT_SLIPPERS_HERO,
  jewelryEnabled: false,
};

/**
 * Merge stored settings with defaults so a partial doc never breaks the UI.
 * Each top-level field falls back to its default if missing/empty.
 */
export function mergeSettings(
  stored: SiteSettings | null | undefined
): Required<Omit<SiteSettings, 'updatedAt' | 'sale'>> & {
  updatedAt?: string;
  sale?: SiteSettings['sale'];
} {
  const heroSlides =
    stored?.heroSlides && stored.heroSlides.length > 0
      ? stored.heroSlides
      : DEFAULT_HERO_SLIDES;

  const categoryImages = {
    ...DEFAULT_CATEGORY_IMAGES,
    ...(stored?.categoryImages || {}),
  };

  return {
    heroSlides,
    categoryImages,
    storyImage: stored?.storyImage || DEFAULT_STORY_IMAGE,
    jewelryHero: stored?.jewelryHero?.image
      ? { ...DEFAULT_JEWELRY_HERO, ...stored.jewelryHero }
      : DEFAULT_JEWELRY_HERO,
    slippersHero: stored?.slippersHero?.image
      ? { ...DEFAULT_SLIPPERS_HERO, ...stored.slippersHero }
      : DEFAULT_SLIPPERS_HERO,
    jewelryEnabled: stored?.jewelryEnabled === true,
    sale: stored?.sale,
    updatedAt: stored?.updatedAt,
  };
}
