/**
 * Runs once when the Node server starts (next start). Logs whether the
 * Firebase Admin SDK authenticated, so a bad/missing hosting key is visible
 * in the Hostinger server log right after a deploy/restart.
 * (This exact `if` form lets Next strip the import from the Edge build.)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { adminSdkSelfTest } = await import('./lib/server/firebaseAdmin');
    await adminSdkSelfTest();
  }
}
