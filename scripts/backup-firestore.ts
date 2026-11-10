/**
 * One-off Firestore backup → backups/<timestamp>/<collection>.json
 *
 *   npm run backup:firestore
 *
 * Mode 1 (preferred): Admin SDK. Set GOOGLE_APPLICATION_CREDENTIALS to a
 *   service-account JSON (Firebase Console → Project settings → Service
 *   accounts → Generate key) and `npm i -D firebase-admin`. Discovers EVERY
 *   collection and subcollection via listCollections(), so attacker-created
 *   collections are found too, and works after the rules are locked down.
 *
 * Mode 2 (fallback): client SDK with the public web config. Only works while
 *   reads are allowed by the rules. The client SDK cannot list collections,
 *   so it backs up the collections the app uses plus a list of probes for
 *   common names. Subcollections are NOT discoverable in this mode.
 *
 * Firestore Timestamps are written as ISO strings, references as paths.
 * The backups/ folder is gitignored — it contains customer PII.
 */
import fs from 'node:fs';
import path from 'node:path';

const KNOWN = ['products', 'orders', 'reviews', 'siteSettings'];
// Probed in client mode to catch junk collections an attacker might create.
const PROBES = [
  'users', 'admins', 'admin', 'customers', 'contacts', 'messages', 'newsletter',
  'subscribers', 'settings', 'config', 'categories', 'carts', 'payments',
  'test', 'tests', 'hacked', 'pwned', 'data', 'logs', 'coupons', 'inventory',
];

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(process.cwd(), 'backups', stamp);

type Plain = unknown;
function toPlain(v: any): Plain {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(toPlain);
  if (typeof v === 'object') {
    if (typeof v.toDate === 'function') return v.toDate().toISOString();
    if (typeof v.path === 'string' && typeof v.id === 'string' && v.firestore) return { __ref: v.path };
    if (typeof v.latitude === 'number' && typeof v.longitude === 'number')
      return { __geo: [v.latitude, v.longitude] };
    const o: Record<string, Plain> = {};
    for (const [k, x] of Object.entries(v)) o[k] = toPlain(x);
    return o;
  }
  return v;
}

function write(name: string, docs: { id: string; path: string; data: Plain }[]) {
  const file = path.join(outDir, `${name.replace(/\//g, '__')}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(docs, null, 2));
}

async function adminMode(): Promise<Record<string, number>> {
  // Optional dependency — only loaded when a service account is configured.
  const modName = 'firebase-admin';
  const admin: any = await import(modName);
  const app = admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = app.firestore();
  const counts: Record<string, number> = {};

  async function dumpCollection(col: any) {
    const snap = await col.get();
    const docs = snap.docs.map((d: any) => ({ id: d.id, path: d.ref.path, data: toPlain(d.data()) }));
    write(col.path, docs);
    counts[col.path] = docs.length;
    for (const d of snap.docs) {
      for (const sub of await d.ref.listCollections()) await dumpCollection(sub);
    }
  }
  for (const col of await db.listCollections()) await dumpCollection(col);
  return counts;
}

async function clientMode(): Promise<Record<string, number>> {
  const { initializeApp } = await import('firebase/app');
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) {
    throw new Error('Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID (or GOOGLE_APPLICATION_CREDENTIALS).');
  }
  const db = getFirestore(initializeApp(config));
  const counts: Record<string, number> = {};
  for (const name of [...KNOWN, ...PROBES]) {
    try {
      const snap = await getDocs(collection(db, name));
      if (snap.empty && !KNOWN.includes(name)) continue; // probe found nothing
      const docs = snap.docs.map((d) => ({ id: d.id, path: d.ref.path, data: toPlain(d.data()) }));
      write(name, docs);
      counts[name] = docs.length;
    } catch (e: any) {
      counts[name] = -1;
      console.error(`  ${name}: ${e?.code || e?.message}`);
    }
  }
  return counts;
}

async function main() {
  const useAdmin = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log(`Mode: ${useAdmin ? 'Admin SDK (full discovery)' : 'client SDK (known collections + probes)'}`);
  const counts = useAdmin ? await adminMode() : await clientMode();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, '_summary.json'), JSON.stringify({ stamp, mode: useAdmin ? 'admin' : 'client', counts }, null, 2));
  console.log(`\nSaved to ${path.relative(process.cwd(), outDir)}/`);
  for (const [k, n] of Object.entries(counts)) console.log(`  ${k.padEnd(28)} ${n < 0 ? 'ERROR' : n}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
