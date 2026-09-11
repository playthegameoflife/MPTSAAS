import { NextResponse } from 'next/server';
// Exact same static imports as /api/generate:
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';
import { submitVideoJobServer } from '@/lib/mpt-server';

export async function GET() {
  const results: Record<string, string> = {};
  try {
    results.getAuth_load = 'ok';
    results.submitVideoJobServer_type = typeof submitVideoJobServer;
    const app = getAdminApp();
    results.admin_init = 'ok';
    results.project = String((app.options as any).projectId ?? '?');
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, stack: (e as Error).stack?.slice(0, 600) }, { status: 500 });
  }
}