/**
 * Grant (or revoke) admin access for a Firebase Auth user.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/outside/repo/key.json \
 *     npm run admin:claim -- you@example.com            # grant
 *   ...  npm run admin:claim -- you@example.com --revoke # remove
 *
 * The service-account key path comes ONLY from GOOGLE_APPLICATION_CREDENTIALS.
 * Keep the key outside the repo; never commit it (.gitignore blocks the
 * usual key filenames). Existing custom claims are preserved.
 * The user must sign out and back in (or wait for the hourly token
 * refresh) before the change applies.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function main() {
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith('--'));
  const revoke = args.includes('--revoke');

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Usage: npm run admin:claim -- <email> [--revoke]');
    process.exit(1);
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service-account key path (outside the repo).');
    process.exit(1);
  }

  initializeApp({ credential: applicationDefault() });
  const auth = getAuth();

  const user = await auth.getUserByEmail(email).catch(() => null);
  if (!user) {
    console.error(`No Firebase Auth user with email ${email}. Create it first (Firebase Console → Authentication → Users → Add user).`);
    process.exit(1);
  }

  const claims = { ...(user.customClaims || {}) };
  if (revoke) delete claims.admin;
  else claims.admin = true;

  await auth.setCustomUserClaims(user.uid, claims);
  // Revoking also kills existing sessions so the change applies immediately.
  if (revoke) await auth.revokeRefreshTokens(user.uid);

  const after = (await auth.getUser(user.uid)).customClaims;
  console.log(`${revoke ? 'Revoked' : 'Granted'} admin for ${email} (uid ${user.uid}). Claims now:`, after);
  if (!revoke) console.log('Sign out and back in on /admin/login for it to take effect.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
