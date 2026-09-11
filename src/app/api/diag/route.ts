import { NextResponse } from 'next/server';

/** Diagnostic: does firebase-admin import cleanly in this deployment? */
export async function GET() {
  try {
    const { getApps } = await import('firebase-admin/app');
    const appCount = getApps().length;
    return NextResponse.json({ ok: true, firebaseAdminImports: true, apps: appCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, stack: (e as Error).stack?.slice(0, 500) }, { status: 500 });
  }
}