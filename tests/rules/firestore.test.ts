/**
 * Security-rules tests against the Firebase emulators.
 *   npm run test:rules
 * (starts the Firestore + Storage emulators via firebase-tools, needs Java)
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { STORE_CONFIG, ORDER_LIMITS, getDeliveryFee, sanitizePhone } from '../../src/lib/constants';

let env: RulesTestEnvironment;

const PRODUCT_A = { name: 'Black Pearl Flats', category: 'Slides', price: 2750, stock: 5, createdAt: '2026-10-01T00:00:00.000Z' };
const PRODUCT_B = { name: 'Ruby Necklace Set', category: 'Necklace', price: 1249, stock: 3, createdAt: '2026-10-01T00:00:00.000Z' };
const FREE_MIN = STORE_CONFIG.freeDeliveryMinTotal;
// Edge-case catalog: on sale, decimal price, exactly at / just under the free-delivery line.
const EDGE_PRODUCTS: Record<string, Record<string, unknown>> = {
  pSale: { name: 'Sale Heels', category: 'Heels', price: 1999, originalPrice: 2999, stock: 9 },
  pDecimal: { name: 'Decimal Ring', category: 'Ring', price: 1999.5, stock: 9 },
  pAtFree: { name: 'At Threshold', category: 'Bridal', price: FREE_MIN, stock: 9 },
  pUnderFree: { name: 'Just Under', category: 'Bridal', price: FREE_MIN - 1, stock: 9 },
  pCheap: { name: 'Cheap Anklet', category: 'Anklet', price: 100, stock: 999 },
};

/** Build an order exactly the way CheckoutModal does (fee from getDeliveryFee). */
function checkoutOrder(lines: { id: string; price: number; quantity: number; [k: string]: unknown }[], customer: Record<string, string> = {}) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryFee = getDeliveryFee(subtotal);
  return validOrder({
    items: lines.map((l, i) => ({ name: `Item ${i}`, cartLineId: `${l.id}-${i}`, ...l })),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    customer: { ...validOrder().customer, ...customer },
  });
}

function validOrder(overrides: Record<string, unknown> = {}) {
  const items = [
    { id: 'pA', name: PRODUCT_A.name, price: 2750, quantity: 1, cartLineId: 'pA-Black-7', selectedSize: 7, selectedColor: 'Black' },
    { id: 'pB', name: PRODUCT_B.name, price: 1249, quantity: 2, cartLineId: 'pB' },
  ];
  const subtotal = 2750 + 1249 * 2; // 5248 → free delivery
  return {
    orderId: 'WA-12345678',
    // Same shape the real checkout sends: empty notes/mapLink when skipped.
    customer: { name: 'Ayesha Khan', phone: '0313 2166431', address: 'House 12, Block 5, Gulshan', city: 'Karachi', notes: '', mapLink: '' } as Record<string, string>,
    items,
    subtotal,
    deliveryFee: 0,
    total: subtotal,
    status: 'pending',
    createdAt: new Date().toISOString(),
    dateDisplay: '10 Nov 2026',
    ...overrides,
  };
}

const publicDb = () => env.unauthenticatedContext().firestore();
const adminDb = () => env.authenticatedContext('admin-uid', { admin: true }).firestore();
const userDb = () => env.authenticatedContext('random-uid').firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wearadora',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc('products/pA').set(PRODUCT_A);
    await db.doc('products/pB').set(PRODUCT_B);
    for (const [id, p] of Object.entries(EDGE_PRODUCTS)) await db.doc(`products/${id}`).set(p);
    await db.doc('siteSettings/main').set({ jewelryEnabled: true });
    await db.doc('orders/existing').set(validOrder());
    await db.doc('reviews/approved1').set({ productId: 'pA', status: 'approved', rating: 5 });
    await db.doc('reviews/pending1').set({ productId: 'pA', status: 'pending', rating: 1, reviewerEmail: 'x@y.com' });
  });
});

after(async () => {
  await env?.cleanup();
});

describe('catalog', () => {
  it('public can read products (get + list)', async () => {
    await assertSucceeds(publicDb().doc('products/pA').get());
    await assertSucceeds(publicDb().collection('products').get());
  });

  it('public can read siteSettings', async () => {
    await assertSucceeds(publicDb().doc('siteSettings/main').get());
  });

  it('public cannot create, update or delete products', async () => {
    await assertFails(publicDb().collection('products').add(PRODUCT_A));
    await assertFails(publicDb().doc('products/pA').update({ price: 1 }));
    await assertFails(publicDb().doc('products/pA').delete());
  });

  it('signed-in non-admin cannot write products or settings', async () => {
    await assertFails(userDb().doc('products/pA').update({ price: 1 }));
    await assertFails(userDb().doc('siteSettings/main').set({ jewelryEnabled: false }));
  });

  it('public cannot write siteSettings', async () => {
    await assertFails(publicDb().doc('siteSettings/main').set({ jewelryEnabled: false }, { merge: true }));
  });

  it('admin can create, update and delete products and settings', async () => {
    await assertSucceeds(adminDb().collection('products').add(PRODUCT_A));
    await assertSucceeds(adminDb().doc('products/pA').update({ price: 2999 }));
    await assertSucceeds(adminDb().doc('products/pB').delete());
    await assertSucceeds(adminDb().doc('siteSettings/main').set({ jewelryEnabled: false }, { merge: true }));
  });
});

describe('orders', () => {
  it('public can create a valid order', async () => {
    await assertSucceeds(publicDb().collection('orders').add(validOrder()));
  });

  it('valid order below Rs 4,500 with Rs 250 delivery is accepted', async () => {
    const items = [{ id: 'pB', name: PRODUCT_B.name, price: 1249, quantity: 1 }];
    await assertSucceeds(
      publicDb().collection('orders').add(validOrder({ items, subtotal: 1249, deliveryFee: 250, total: 1499 }))
    );
  });

  it('optional notes and Google Maps link are accepted', async () => {
    const o = validOrder();
    o.customer = { ...o.customer, notes: 'Call before delivery', mapLink: 'https://maps.google.com/?q=24.86,67.01' };
    await assertSucceeds(publicDb().collection('orders').add(o));
  });

  it('rejects a tampered item price (client price not trusted)', async () => {
    const o = validOrder();
    o.items[0].price = 1;
    o.subtotal = 1 + 1249 * 2;
    o.total = o.subtotal + 250;
    o.deliveryFee = 250;
    await assertFails(publicDb().collection('orders').add(o));
  });

  it('rejects a total that does not add up', async () => {
    await assertFails(publicDb().collection('orders').add(validOrder({ total: 10 })));
  });

  it('rejects a skipped delivery fee below the free threshold', async () => {
    const items = [{ id: 'pB', name: PRODUCT_B.name, price: 1249, quantity: 1 }];
    await assertFails(publicDb().collection('orders').add(validOrder({ items, subtotal: 1249, deliveryFee: 0, total: 1249 })));
  });

  it('rejects a non-Google-Maps link', async () => {
    const o = validOrder();
    o.customer = { ...o.customer, mapLink: 'https://evil.example/x' };
    await assertFails(publicDb().collection('orders').add(o));
  });

  it('rejects a non-pending status, extra fields, unknown products and bad phones', async () => {
    await assertFails(publicDb().collection('orders').add(validOrder({ status: 'completed' })));
    await assertFails(publicDb().collection('orders').add(validOrder({ isAdmin: true })));
    const ghost = validOrder();
    ghost.items[0].id = 'does-not-exist';
    await assertFails(publicDb().collection('orders').add(ghost));
    const o = validOrder();
    o.customer = { ...o.customer, phone: '<script>' };
    await assertFails(publicDb().collection('orders').add(o));
  });

  it('rejects empty orders and more than 10 lines', async () => {
    await assertFails(publicDb().collection('orders').add(validOrder({ items: [], subtotal: 0, deliveryFee: 250, total: 250 })));
    const many = Array.from({ length: 11 }, () => ({ id: 'pB', name: 'x', price: 1249, quantity: 1 }));
    await assertFails(publicDb().collection('orders').add(validOrder({ items: many, subtotal: 1249 * 11, deliveryFee: 0, total: 1249 * 11 })));
  });

  it('public cannot read, list, update or delete orders', async () => {
    await assertFails(publicDb().doc('orders/existing').get());
    await assertFails(publicDb().collection('orders').get());
    await assertFails(publicDb().doc('orders/existing').update({ status: 'cancelled' }));
    await assertFails(publicDb().doc('orders/existing').delete());
  });

  it('signed-in non-admin cannot read orders', async () => {
    await assertFails(userDb().collection('orders').get());
  });

  it('admin can read, update and delete orders', async () => {
    await assertSucceeds(adminDb().collection('orders').orderBy('createdAt', 'desc').get());
    await assertSucceeds(adminDb().doc('orders/existing').update({ status: 'confirmed' }));
    await assertSucceeds(adminDb().doc('orders/existing').delete());
  });
});

describe('reviews', () => {
  const review = (o: Record<string, unknown> = {}) => ({
    productId: 'pA',
    productName: PRODUCT_A.name,
    reviewerName: 'Sana',
    rating: 5,
    comment: 'Very comfortable and well made.',
    images: [],
    status: 'pending',
    source: 'customer',
    createdAt: new Date().toISOString(),
    ...o,
  });

  it('public can read approved reviews via a status-filtered query', async () => {
    await assertSucceeds(
      publicDb().collection('reviews').where('productId', '==', 'pA').where('status', '==', 'approved').get()
    );
    await assertSucceeds(publicDb().doc('reviews/approved1').get());
  });

  it('public cannot read pending reviews or run an unfiltered query', async () => {
    await assertFails(publicDb().doc('reviews/pending1').get());
    await assertFails(publicDb().collection('reviews').where('productId', '==', 'pA').get());
  });

  it('public can submit a pending customer review', async () => {
    await assertSucceeds(publicDb().collection('reviews').add(review()));
  });

  it('public cannot self-approve, pose as admin or mark verified', async () => {
    await assertFails(publicDb().collection('reviews').add(review({ status: 'approved' })));
    await assertFails(publicDb().collection('reviews').add(review({ source: 'admin' })));
    await assertFails(publicDb().collection('reviews').add(review({ verified: true })));
  });

  it('public cannot update or delete reviews; admin can', async () => {
    await assertFails(publicDb().doc('reviews/pending1').update({ status: 'approved' }));
    await assertFails(publicDb().doc('reviews/approved1').delete());
    await assertSucceeds(adminDb().doc('reviews/pending1').update({ status: 'approved' }));
    await assertSucceeds(adminDb().collection('reviews').orderBy('createdAt', 'desc').get());
  });
});

describe('order pricing edge cases (a valid cart must never be blocked)', () => {
  it('rules hardcode the same delivery fee, threshold and limits as src/lib/constants.ts', () => {
    const rules = readFileSync('firestore.rules', 'utf8');
    const fee = rules.match(/subtotal >= (\d+) && fee == 0\) \|\| \(subtotal < (\d+) && fee == (\d+)/);
    if (!fee) throw new Error('feeOk() not found in firestore.rules');
    const [, a, b, c] = fee.map(Number);
    if (a !== FREE_MIN || b !== FREE_MIN || c !== STORE_CONFIG.deliveryFee) {
      throw new Error(`rules fee ${a}/${b}/${c} ≠ STORE_CONFIG ${FREE_MIN}/${STORE_CONFIG.deliveryFee}`);
    }
    if (!rules.includes(`q <= ${ORDER_LIMITS.maxQtyPerLine}`)) throw new Error('qty cap mismatch');
    if (!rules.includes(`n <= ${ORDER_LIMITS.maxLines}`)) throw new Error('line cap mismatch');
  });

  it('sale price: the discounted price is accepted, the original (strike-through) price is not', async () => {
    await assertSucceeds(publicDb().collection('orders').add(checkoutOrder([{ id: 'pSale', price: 1999, quantity: 1 }])));
    await assertFails(publicDb().collection('orders').add(checkoutOrder([{ id: 'pSale', price: 2999, quantity: 1 }])));
  });

  it('variants: same product in different sizes/colours as separate lines is accepted', async () => {
    await assertSucceeds(
      publicDb().collection('orders').add(
        checkoutOrder([
          { id: 'pA', price: 2750, quantity: 1, selectedSize: 6, selectedColor: 'Black' },
          { id: 'pA', price: 2750, quantity: 2, selectedSize: 8, selectedColor: 'Gold' },
        ])
      )
    );
  });

  it(`free delivery is inclusive: exactly Rs ${FREE_MIN} ships free`, async () => {
    const at = checkoutOrder([{ id: 'pAtFree', price: FREE_MIN, quantity: 1 }]);
    if (at.deliveryFee !== 0) throw new Error('getDeliveryFee should be 0 at the threshold');
    await assertSucceeds(publicDb().collection('orders').add(at));
    // Charging the fee at exactly the threshold is rejected (customer would be overcharged).
    await assertFails(publicDb().collection('orders').add({ ...at, deliveryFee: STORE_CONFIG.deliveryFee, total: FREE_MIN + STORE_CONFIG.deliveryFee }));
  });

  it(`Rs ${FREE_MIN - 1} pays the Rs ${STORE_CONFIG.deliveryFee} fee; free delivery there is rejected`, async () => {
    const under = checkoutOrder([{ id: 'pUnderFree', price: FREE_MIN - 1, quantity: 1 }]);
    if (under.deliveryFee !== STORE_CONFIG.deliveryFee) throw new Error('fee expected below threshold');
    await assertSucceeds(publicDb().collection('orders').add(under));
    await assertFails(publicDb().collection('orders').add({ ...under, deliveryFee: 0, total: FREE_MIN - 1 }));
  });

  it('threshold reached through quantity (2 × 2250 = 4500) ships free', async () => {
    await env.withSecurityRulesDisabled((ctx) => ctx.firestore().doc('products/p2250').set({ name: 'x', price: 2250 }));
    const o = checkoutOrder([{ id: 'p2250', price: 2250, quantity: 2 }]);
    if (o.deliveryFee !== 0) throw new Error('expected free delivery');
    await assertSucceeds(publicDb().collection('orders').add(o));
  });

  it('decimal prices are accepted', async () => {
    await assertSucceeds(publicDb().collection('orders').add(checkoutOrder([{ id: 'pDecimal', price: 1999.5, quantity: 3 }])));
  });

  it(`max cart: ${ORDER_LIMITS.maxLines} lines and qty ${ORDER_LIMITS.maxQtyPerLine} are accepted`, async () => {
    const lines = Array.from({ length: ORDER_LIMITS.maxLines }, (_, i) => ({
      id: i % 2 ? 'pCheap' : 'pB',
      price: i % 2 ? 100 : 1249,
      quantity: i === 0 ? ORDER_LIMITS.maxQtyPerLine : 1,
    }));
    await assertSucceeds(publicDb().collection('orders').add(checkoutOrder(lines)));
  });

  it(`qty ${ORDER_LIMITS.maxQtyPerLine + 1} is rejected (the cart clamps to ${ORDER_LIMITS.maxQtyPerLine})`, async () => {
    await assertFails(
      publicDb().collection('orders').add(checkoutOrder([{ id: 'pCheap', price: 100, quantity: ORDER_LIMITS.maxQtyPerLine + 1 }]))
    );
  });

  it('shortest customer details checkout allows are accepted; messy phone input is sanitised', async () => {
    const L = ORDER_LIMITS;
    const customer = {
      name: 'A'.repeat(L.name.min),
      address: 'B'.repeat(L.address.min),
      city: 'C'.repeat(L.city.min),
      phone: sanitizePhone('0313.216-6431 ext'),
      notes: 'N'.repeat(L.notes.max),
    };
    await assertSucceeds(publicDb().collection('orders').add(checkoutOrder([{ id: 'pB', price: 1249, quantity: 1 }], customer)));
    for (const phone of ['+92 313 2166431', '(0313) 216-6431', '923132166431']) {
      await assertSucceeds(
        publicDb().collection('orders').add(checkoutOrder([{ id: 'pB', price: 1249, quantity: 1 }], { phone: sanitizePhone(phone) }))
      );
    }
  });

  it('a stale cart price (catalog changed) is rejected — checkout re-prices before submitting', async () => {
    await assertFails(publicDb().collection('orders').add(checkoutOrder([{ id: 'pB', price: 999, quantity: 1 }])));
  });
});

describe('reviewPrivate (reviewer emails)', () => {
  const pendingReview = {
    productId: 'pA',
    reviewerName: 'Sana',
    rating: 5,
    comment: 'Very comfortable and well made.',
    status: 'pending',
    source: 'customer',
    createdAt: new Date().toISOString(),
  };

  it('customer can write review + email in one batch', async () => {
    const db = publicDb();
    const ref = db.collection('reviews').doc();
    const batch = db.batch();
    batch.set(ref, pendingReview);
    batch.set(db.doc(`reviewPrivate/${ref.id}`), { reviewerEmail: 'sana@example.com', createdAt: pendingReview.createdAt });
    await assertSucceeds(batch.commit());
  });

  it('email on the public review doc is rejected', async () => {
    await assertFails(publicDb().collection('reviews').add({ ...pendingReview, reviewerEmail: 'sana@example.com' }));
  });

  it("can't attach or overwrite an email on an existing review, or use a bad email", async () => {
    await assertFails(publicDb().doc('reviewPrivate/approved1').set({ reviewerEmail: 'evil@example.com' }));
    const db = publicDb();
    const ref = db.collection('reviews').doc();
    const batch = db.batch();
    batch.set(ref, pendingReview);
    batch.set(db.doc(`reviewPrivate/${ref.id}`), { reviewerEmail: 'not-an-email' });
    await assertFails(batch.commit());
  });

  it('public cannot read emails; admin can read and delete them', async () => {
    await env.withSecurityRulesDisabled((ctx) => ctx.firestore().doc('reviewPrivate/approved1').set({ reviewerEmail: 'a@b.co' }));
    await assertFails(publicDb().doc('reviewPrivate/approved1').get());
    await assertFails(publicDb().collection('reviewPrivate').get());
    await assertSucceeds(adminDb().collection('reviewPrivate').get());
    await assertSucceeds(adminDb().doc('reviewPrivate/approved1').delete());
  });
});

describe('default deny', () => {
  it('unknown collections are closed to everyone but nobody can write them', async () => {
    await assertFails(publicDb().collection('hacked').add({ x: 1 }));
    await assertFails(publicDb().collection('users').get());
    await assertFails(adminDb().collection('hacked').add({ x: 1 }));
  });
});

describe('storage', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

  it('public can read product images', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.storage().ref('products/a.png').put(png, { contentType: 'image/png' }).then();
    });
    await assertSucceeds(env.unauthenticatedContext().storage().ref('products/a.png').getMetadata());
  });

  it('public cannot upload', async () => {
    await assertFails(
      env.unauthenticatedContext().storage().ref('products/b.png').put(png, { contentType: 'image/png' }).then()
    );
  });

  it('admin can upload images but not other types or oversize files', async () => {
    const admin = env.authenticatedContext('admin-uid', { admin: true }).storage();
    await assertSucceeds(admin.ref('products/c.png').put(png, { contentType: 'image/png' }).then());
    await assertFails(admin.ref('products/d.html').put(png, { contentType: 'text/html' }).then());
    await assertFails(
      admin.ref('products/e.png').put(new Uint8Array(5 * 1024 * 1024 + 1), { contentType: 'image/png' }).then()
    );
  });

  it('nothing outside /products is readable or writable', async () => {
    const admin = env.authenticatedContext('admin-uid', { admin: true }).storage();
    await assertFails(admin.ref('other/x.png').put(png, { contentType: 'image/png' }).then());
    await assertFails(env.unauthenticatedContext().storage().ref('other/x.png').getMetadata());
  });
});
