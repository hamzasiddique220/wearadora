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

let env: RulesTestEnvironment;

const PRODUCT_A = { name: 'Black Pearl Flats', category: 'Slides', price: 2750, stock: 5, createdAt: '2026-10-01T00:00:00.000Z' };
const PRODUCT_B = { name: 'Ruby Necklace Set', category: 'Necklace', price: 1249, stock: 3, createdAt: '2026-10-01T00:00:00.000Z' };

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
