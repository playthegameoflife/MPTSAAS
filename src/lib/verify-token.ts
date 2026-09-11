import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getAdminApp } from './firebase-admin';

/**
 * Verify a Firebase ID token WITHOUT firebase-admin/auth.
 *
 * Why: firebase-admin's Auth module pulls jwks-rsa → jose, and jwks-rsa does a
 * CJS require() of the ESM-only jose package, which ERR_REQUIRE_ESM's on Vercel
 * serverless functions. Firestore + Storage from firebase-admin work fine,
 * so we only avoid the broken Auth path.
 *
 * This verifies the JWT directly against Google's public cert set using jose
 * (which Vercel bundles cleanly as ESM). Returns the UID on success, throws on failure.
 */
const projectId = 'moneyprinterturbo-dcaf8';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string }> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ['RS256'],
  });
  const uid = payload.sub;
  if (!uid) throw new Error('Token has no subject');
  return { uid };
}

// keep getAdminApp re-exported so routes can reuse the same app instance
export { getAdminApp };