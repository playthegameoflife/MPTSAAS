import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/verify-token';
import { adminFirestore } from '@/lib/firebase-admin';

/**
 * Diagnostic: time each step of the generate pipeline separately to find the hang.
 * Requires a valid token. Returns timing per step, never hangs silently.
 */
export async function GET(request: Request) {
  const timings: Record<string, string | number | boolean> = {};
  const start = Date.now();
  const authHeader = request.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!idToken) return NextResponse.json({ error: 'no token' }, { status: 401 });
  timings.token_present = true;

  // 1. Verify token
  const t1 = Date.now();
  let uid: string | null = null;
  try {
    uid = (await verifyFirebaseToken(idToken)).uid;
    timings.verify_ms = Date.now() - t1;
  } catch (e) {
    return NextResponse.json({ error: 'auth failed', msg: (e as Error).message, verify_ms: Date.now() - t1 }, { status: 200 });
  }
  timings.uid = uid;

  // 2. Firestore read (the credit check writes; just do a get)
  const t2 = Date.now();
  try {
    const db = adminFirestore();
    timings.firestore_import_ms = Date.now() - t2;
    const t2b = Date.now();
    const snap = await db.collection('users').doc(uid).get();
    timings.firestore_get_ms = Date.now() - t2b;
    timings.doc_exists = snap.exists;
  } catch (e) {
    timings.firestore_err = (e as Error).message;
  }

  timings.total_ms = Date.now() - start;
  return NextResponse.json({ ok: true, timings });
}

// Also test POST does nothing heavy
export async function POST(request: Request) {
  return GET(request);
}