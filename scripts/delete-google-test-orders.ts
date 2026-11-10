/**
 * Remove the automated Google test orders: phone 650-253-0000 (Google HQ,
 * Mountain View) or 02 9374 4000 (Google Sydney, 48 Pirrama Road).
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/outside/repo/key.json \
 *     npm run orders:delete-google-tests            # DRY RUN: lists matches only
 *   ...  npm run orders:delete-google-tests -- --confirm   # actually deletes
 *
 * Safety: only matches orders whose phone digits are exactly one of those
 * numbers (with or without country code) AND whose status is still "pending".
 * Each deleted order is printed in full first, so you have a record.
 * Run `npm run backup:firestore` before using --confirm.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const GOOGLE_PHONE = /^(?:1?6502530000|(?:61|0)293744000)$/;

async function main() {
  const confirm = process.argv.includes('--confirm');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service-account key path (outside the repo).');
    process.exit(1);
  }
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  const snap = await db.collection('orders').get();
  const matches = snap.docs.filter((d) => {
    const o = d.data();
    const digits = String(o.customer?.phone || '').replace(/\D/g, '');
    return GOOGLE_PHONE.test(digits) && o.status === 'pending';
  });

  console.log(`${matches.length} Google test order(s) found (of ${snap.size} orders):`);
  for (const d of matches) {
    const o = d.data();
    console.log(`  ${d.id}  ${o.orderId}  ${o.createdAt}  Rs ${o.total}  ${o.customer?.name} / ${o.customer?.city}`);
  }

  if (!confirm) {
    console.log('\nDry run — nothing deleted. Re-run with --confirm to delete these.');
    process.exit(0);
  }

  const batch = db.batch();
  for (const d of matches) {
    console.log('DELETING', d.id, JSON.stringify(d.data()));
    batch.delete(d.ref);
  }
  await batch.commit();
  console.log(`Deleted ${matches.length} order(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
