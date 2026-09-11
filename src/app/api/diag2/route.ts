import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/verify-token';

/** Test outbound reachability to MPT from Vercel's serverless network. */
export async function GET(request: Request) {
  const out: Record<string, unknown> = {};
  const authHeader = request.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) return NextResponse.json({ error: 'no token' }, { status: 401 });
  try {
    await verifyFirebaseToken(idToken);
  } catch { return NextResponse.json({ error: 'auth' }); }

  // Test MPT HTTP reachability with a short timeout
  try {
    const t0 = Date.now();
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch('http://76.13.30.74:8080/api/v1/tasks', { signal: ctrl.signal });
    clearTimeout(to);
    out.mpt_http = { status: res.status, time_ms: Date.now() - t0 };
  } catch (e) {
    out.mpt_http_err = (e as Error).name + ': ' + (e as Error).message;
  }

  // Test MPT HTTPS? none. Test a known public HTTPS endpoint for contrast
  try {
    const t0 = Date.now();
    const res = await fetch('https://www.google.com', { signal: AbortSignal.timeout(8000) });
    out.google = { status: res.status, time_ms: Date.now() - t0 };
  } catch (e) {
    out.google_err = (e as Error).message;
  }

  return NextResponse.json({ ok: true, out });
}