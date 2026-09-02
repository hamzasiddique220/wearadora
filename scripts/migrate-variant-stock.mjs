// One-time migration: for every slipper product that already has colors set,
// turn on every size (6-11) for every color, using the product's current flat
// `stock` number as the starting quantity for each size — so nothing goes
// "Out of Stock" the moment the new per-color size UI ships. Re-review and
// adjust real per-size counts afterward in Admin → Products.
//
// Safe to re-run: any product that already has a non-empty `variantStock`
// (i.e. you've already edited it by hand) is skipped, not overwritten.
//
// Run with:  node scripts/migrate-variant-stock.mjs

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
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

const SLIPPER_SIZES = [6, 7, 8, 9, 10, 11];
const variantKey = (color, size) => `${color}__${size}`;

console.log('→ Loading products...');
const snapshot = await getDocs(collection(db, 'products'));

let migrated = 0;
let skippedNoColors = 0;
let skippedAlready = 0;

for (const docSnap of snapshot.docs) {
  const p = { id: docSnap.id, ...docSnap.data() };
  const colors = Array.isArray(p.colors) ? p.colors : [];

  if (colors.length === 0) {
    skippedNoColors++;
    continue;
  }
  if (p.variantStock && Object.keys(p.variantStock).length > 0) {
    console.log(`  – Skipping "${p.name}" (variantStock already set)`);
    skippedAlready++;
    continue;
  }

  const perSizeQty = typeof p.stock === 'number' && p.stock > 0 ? p.stock : 5;
  const variantStock = {};
  for (const color of colors) {
    for (const size of SLIPPER_SIZES) {
      variantStock[variantKey(color, size)] = perSizeQty;
    }
  }
  const totalStock = Object.values(variantStock).reduce((s, n) => s + n, 0);

  await updateDoc(doc(db, 'products', p.id), {
    variantStock,
    stock: totalStock,
    sizes: [],
  });

  migrated++;
  console.log(
    `  ✓ "${p.name}" — ${colors.length} color${colors.length === 1 ? '' : 's'} × ${SLIPPER_SIZES.length} sizes @ ${perSizeQty} each = ${totalStock} total`
  );
}

console.log(
  `\n✓ Done. Migrated ${migrated}, skipped ${skippedNoColors} (no colors), skipped ${skippedAlready} (already set).`
);
console.log(
  'Go review each product in Admin → Products and correct the real per-size stock counts.'
);
process.exit(0);
