import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK — SERVER-ONLY.
 * Uses the service account (FIREBASE_SERVICE_ACCOUNT env, JSON string)
 * to upload videos to the user's Firebase Storage on their behalf,
 * independent of any logged-in browser session.
 *
 * Never import this from client components. Only call from /api/* routes.
 */
let _app: App | null = null;
let _bootAttempted = false;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app!;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT env not set');
  }
  let sa: Record<string, string>;
  try {
    sa = typeof raw === 'string' && raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (e) {
    throw new Error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT is not valid JSON: ' + (e as Error).message);
  }
  _app = initializeApp({ credential: cert(sa as any), storageBucket: 'moneyprinterturbo-dcaf8.firebasestorage.app' });
  _bootAttempted = true;
  return _app;
}

export function adminStorage() {
  return getStorage(getAdminApp());
}

export function adminFirestore() {
  return getFirestore(getAdminApp());
}

export { getAdminApp };