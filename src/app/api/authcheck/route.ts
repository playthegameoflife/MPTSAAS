import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
// Try getFirestore (storage path) vs getAuth separately

export async function GET() {
  const results: Record<string, string> = {};
  try {
    // Test 1: just import firestore module and init
    const fs = await import('firebase-admin/firestore');
    const fstore = fs.getFirestore(getAdminApp());
    results.firestore_getFirestore = 'ok:' + typeof fstore.collection;
  } catch (e) {
    results.firestore_err = (e as Error).message;
  }
  try {
    // Test 2: import auth module and call getAuth
    const auth = await import('firebase-admin/auth');
    results.auth_getAuth = typeof auth.getAuth;
    const a = auth.getAuth(getAdminApp());
    results.auth_getAuth_called = 'ok:' + typeof a.verifyIdToken;
  } catch (e) {
    results.auth_err = (e as Error).message;
  }
  return NextResponse.json({ ok: true, results });
}