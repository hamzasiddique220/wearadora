import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const SIZES_6_11 = [6, 7, 8, 9, 10, 11];

const products = [
  {
    name: 'Black Block Heel Embellished Slides',
    category: 'Slides',
    productType: 'slippers',
    price: 2200,
    originalPrice: 4000,
    stock: 18,
    image:
      'https://wearadora.com/wp-content/uploads/2016/07/main-WA-1-black-card-img.png',
    description:
      'Step into modern elegance with these black multi-strap heels by Wear Adora, designed to combine minimal style with a touch of sparkle. Featuring a sleek black base with multiple straps, including a shimmering rhinestone band, these heels add subtle glamour to your overall look. The sturdy block heel provides comfortable elevation and stability, making them suitable for extended wear. The square-toe design enhances the contemporary feel, while the cushioned insole ensures a soft and supportive fit throughout the day.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Black', 'Beige'],
  },
  {
    name: 'Beige Block Heel Embellished Slides',
    category: 'Slides',
    productType: 'slippers',
    price: 2200,
    originalPrice: 4000,
    stock: 15,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/beige-card-img.png',
    description:
      'Elevate your everyday with these beige block heel slides featuring embellished straps and a shimmering rhinestone band. The sturdy block heel offers comfortable elevation while the square-toe design adds a contemporary edge. Cushioned insole ensures all-day comfort — perfect for both casual and semi-formal occasions.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Beige', 'Black'],
  },
  {
    name: 'Classic Tan Strap Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 1800,
    originalPrice: 3500,
    stock: 20,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-8-3.png',
    description:
      'Timeless tan strap heels crafted with minimalist elegance. Delicate straps cross the foot for a refined silhouette, while the comfortable block heel ensures stability. Perfect for work, dinner, or any occasion that calls for understated sophistication.',
    isNew: false,
    sizes: SIZES_6_11,
    colors: ['Tan'],
  },
  {
    name: 'Classic Tan Minimal Strap Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 1800,
    originalPrice: 3500,
    stock: 14,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-1-4.png',
    description:
      'A refined variation of our classic tan heels, featuring a sleek minimal strap design. Crafted for elegance and comfort, with a cushioned footbed and stable heel. The versatile tan shade pairs effortlessly with every outfit.',
    isNew: false,
    sizes: SIZES_6_11,
    colors: ['Tan'],
  },
  {
    name: 'Classic Beige Toe-Ring Slides',
    category: 'Slides',
    productType: 'slippers',
    price: 2000,
    originalPrice: 4000,
    stock: 22,
    image:
      'https://wearadora.com/wp-content/uploads/2016/07/remove.photos-removed-background.png',
    description:
      'Keep it simple and comfortable with these classic beige toe-ring slides by Wear Adora, designed for everyday ease. Featuring a soft beige upper with a sleek toe-loop design, these slides offer a clean and minimal look that pairs effortlessly with daily outfits. The flat sole ensures maximum comfort, while the cushioned footbed provides a relaxed feel for all-day wear.',
    isNew: false,
    sizes: SIZES_6_11,
    colors: ['Beige'],
  },
  {
    name: 'Luxury Gold Croc-Textured Slides',
    category: 'Slides',
    productType: 'slippers',
    price: 1700,
    originalPrice: 2500,
    stock: 16,
    image: 'https://wearadora.com/wp-content/uploads/2016/07/sliper.png',
    description:
      'Bold gold slides with a croc-textured finish and criss-cross straps — perfect for standout festive styling. Features a metallic gold finish with textured pattern, stylish criss-cross strap design, glossy gold insole, and flat sole for comfortable wear. Ideal for festive occasions, dinners, and statement styling.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Gold'],
  },
  {
    name: 'Elegant Nude Knot Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 2100,
    originalPrice: 4000,
    stock: 12,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-9.png',
    description:
      'Graceful nude heels featuring a delicate knot detail across the top. The soft nude finish adds refined elegance, while the comfortable heel provides the perfect elevation. Cushioned footbed ensures comfort throughout your day — perfect for formal events and upscale occasions.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Nude'],
  },
  {
    name: 'Elegant Nude Bow Slides',
    category: 'Slides',
    productType: 'slippers',
    price: 2200,
    originalPrice: 4000,
    stock: 19,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-12.png',
    description:
      'Step into subtle elegance with these beautifully designed nude bow slides by Wear Adora, perfect for women who appreciate minimal style with a touch of glamour. Featuring a soft nude finish and a delicately crafted rhinestone bow detail, these sandals offer a refined and graceful look for any occasion. The modern square-toe shape adds a trendy edge, while the cushioned insole ensures a soft and relaxed feel with every step.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Beige', 'Black'],
  },
  {
    name: 'Elegant Ash Multi-Strap Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 1900,
    originalPrice: 3500,
    stock: 13,
    image:
      'https://wearadora.com/wp-content/uploads/2026/03/remove.photos-removed-background-3.png',
    description:
      'Sophisticated ash-toned heels featuring multiple delicate straps for a modern, refined look. The subtle grey-beige finish complements every wardrobe, while the comfortable block heel adds graceful elevation. Ideal for dinners, parties, and elegant gatherings.',
    isNew: false,
    sizes: SIZES_6_11,
    colors: ['Ash'],
  },
  {
    name: 'Elegant Black Multi-Strap Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 1900,
    originalPrice: 3500,
    stock: 17,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-7-1.png',
    description:
      'Timeless black multi-strap heels that effortlessly elevate any outfit. Designed with delicate straps and a stable block heel for comfort with elegance. The classic black finish makes them a versatile staple for evenings, dinners, and formal events.',
    isNew: false,
    sizes: SIZES_6_11,
    colors: ['Black'],
  },
  {
    name: 'Elegant Golden Bow Heels',
    category: 'Heels',
    productType: 'slippers',
    price: 2200,
    originalPrice: 4000,
    stock: 11,
    image:
      'https://wearadora.com/wp-content/uploads/2026/04/remove.photos-removed-background-7.png',
    description:
      'Luxury golden bow heels featuring a glittery upper with delicate bow detail and glossy metallic finish. Shimmering insole and comfortable block heel provide a premium look with elevation. Open-toe design adds a modern touch — perfect for weddings, festive events, and special occasions.',
    isNew: true,
    sizes: SIZES_6_11,
    colors: ['Golden', 'Silver'],
  },
  {
    name: 'Diamond Pendant Necklace',
    category: 'Necklace',
    productType: 'jewelry',
    price: 12000,
    originalPrice: 15000,
    stock: 6,
    image:
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=85',
    description:
      'Exquisite diamond pendant necklace crafted for timeless elegance. Featuring a brilliant-cut stone in a fine chain setting, this piece adds refined sparkle to both casual and formal attire.',
    isNew: false,
    sizes: [],
    colors: [],
  },
  {
    name: 'Diamond Solitaire Ring',
    category: 'Ring',
    productType: 'jewelry',
    price: 20000,
    originalPrice: 25000,
    stock: 4,
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=85',
    description:
      'A statement solitaire ring featuring a dazzling center stone in a classic prong setting. Crafted for those moments that deserve to shine — engagements, anniversaries, and unforgettable evenings.',
    isNew: false,
    sizes: [],
    colors: [],
  },
  {
    name: 'Diamond Stud Earrings',
    category: 'Earring',
    productType: 'jewelry',
    price: 9500,
    originalPrice: 12000,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=85',
    description:
      'Classic diamond stud earrings designed to complement every style. Secure post-back closure and brilliant cut for maximum sparkle — an essential for your jewelry collection.',
    isNew: false,
    sizes: [],
    colors: [],
  },
  {
    name: 'Diamond Tennis Bracelet',
    category: 'Bracelet',
    productType: 'jewelry',
    price: 18000,
    originalPrice: 22000,
    stock: 5,
    image:
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=85',
    description:
      'An elegant tennis bracelet featuring a continuous line of sparkling stones. Secure clasp and flexible design make it perfect for layering or wearing alone as a statement piece.',
    isNew: false,
    sizes: [],
    colors: [],
  },
];

console.log('→ Deleting existing products...');
console.log('→ Deleting existing products...');
const existing = await getDocs(collection(db, 'products'));
let deleted = 0;
for (const doc of existing.docs) {
  await deleteDoc(doc.ref);
  deleted++;
}
console.log(`  ✓ Deleted ${deleted} old products`);

console.log(`\n→ Seeding ${products.length} real products from wearadora.com...`);
let added = 0;
for (const p of products) {
  try {
    const ref = await addDoc(collection(db, 'products'), {
      ...p,
      createdAt: new Date().toISOString(),
    });
    added++;
    console.log(`  ✓ [${added}/${products.length}] ${p.name} (Rs.${p.price})`);
  } catch (err) {
    console.error(`  ✗ Failed: ${p.name}`, err.message);
  }
}

console.log(`\n✓ Done. ${added}/${products.length} products added.`);
process.exit(0);
