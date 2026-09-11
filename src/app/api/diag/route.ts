import { NextResponse } from 'next/server';
// Static imports — SAME as /api/generate to reproduce its load behavior
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';

/** Diagnostic: statically import + init the exact modules /api/generate uses. */
export async function GET() {
  try {
    const app = getAdminApp();
    return NextResponse.json({ ok: true, init: 'success', project: app.options.projectId, storageBucket: app.options.storageBucket });
  } catch (e) {
    return NextResponse.json({ ok: false, init: 'fail', error: (e as Error).message, stack: (e as Error).stack?.slice(0, 800) }, { status: 500 });
  }
}