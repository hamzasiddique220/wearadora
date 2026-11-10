/**
 * Remove data created while testing on the LIVE database.
 * Convention: every test order uses customer name starting "TEST" and every
 * test review uses reviewer name starting "TEST" (e.g. "TEST Hamza").
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/outside/repo/key.json \
 *     npm run test-data:delete              # DRY RUN — lists matches only
 *   ...  npm run test-data:delete -- --confirm
 *
 * Deletes: orders/{id} where customer.name starts with "TEST",
 *          reviews/{id} where reviewerName starts with "TEST" (+ reviewPrivate/{id}).
 * Prints every document in full before deleting so you keep a record.
 * Images uploaded during testing must be removed in Cloudinary → Media Library.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const isTest = (v: unknown) => /^TEST\b/.test(String(v || '').trim());

async function main() {
  const confirm = process.argv.includes('--confirm');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service-account key path (outside the repo).');
    process.exit(1);
  }
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  const orders = (await db.collection('orders').get()).docs.filter((d) => isTest(d.data().customer?.name));
  const reviews = (await db.collection('reviews').get()).docs.filter((d) => isTest(d.data().reviewerName));

  console.log(`Test orders (${orders.length}):`);
  for (const d of orders) {
    const o = d.data();
    console.log(`  ${d.id}  ${o.orderId}  ${o.createdAt}  Rs ${o.total}  ${o.customer?.name}  [${o.status}]`);
  }
  console.log(`Test reviews (${reviews.length}):`);
  for (const d of reviews) {
    const r = d.data();
    console.log(`  ${d.id}  ${r.reviewerName}  ${r.productName || r.productId}  [${r.status}]  images: ${(r.images || []).length}`);
  }

  if (!confirm) {
    console.log('\nDry run — nothing deleted. Re-run with --confirm to delete the above.');
    process.exit(0);
  }

  const batch = db.batch();
  for (const d of orders) {
    console.log('DELETING order', d.id, JSON.stringify(d.data()));
    batch.delete(d.ref);
  }
  for (const d of reviews) {
    console.log('DELETING review', d.id, JSON.stringify(d.data()));
    batch.delete(d.ref);
    batch.delete(db.doc(`reviewPrivate/${d.id}`));
  }
  await batch.commit();
  console.log(`Deleted ${orders.length} order(s) and ${reviews.length} review(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
