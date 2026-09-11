import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';

/** Isolate: does getAuth().verifyIdToken crash the lambda, or is it the extra modules/dynamic imports? */
export async function GET() {
  try {
    const result = await getAuth(getAdminApp()).verifyIdToken('definitely-invalid');
    return NextResponse.json({ ok: true, uid: result.uid });
  } catch (e) {
    const err = e as Error & { code?: string };
    return NextResponse.json({ ok: 'caught', rejected: true, error: err.code ?? err.message }, { status: 200 });
  }
}

export async function POST() {
  try {
    const result = await getAuth(getAdminApp()).verifyIdToken('definitely-invalid');
    return NextResponse.json({ ok: true, uid: result.uid });
  } catch (e) {
    const err = e as Error & { code?: string };
    return NextResponse.json({ ok: 'caught', rejected: true, error: err.code ?? err.message });
  }
}