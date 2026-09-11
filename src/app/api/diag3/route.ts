import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/verify-token';

/** Raw MPT POST /videos from Vercel — isolate whether POST egress hangs vs GET. */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) return NextResponse.json({ error: 'no token' }, { status: 401 });
  try { await verifyFirebaseToken(idToken); } catch { return NextResponse.json({ error: 'auth' }); }

  const out: Record<string, unknown> = {};
  const mptKey = process.env.MPT_API_KEY ?? '';
  const base = (process.env.MPT_BASE_URL ?? 'http://76.13.30.74:8080').replace(/\/+$/, '') + '/api/v1';

  // Test 1: raw GET /tasks
  try {
    const t0 = Date.now();
    const r = await fetch(base + '/tasks', { signal: AbortSignal.timeout(15000) });
    out.GET_tasks = { status: r.status, ms: Date.now() - t0, body: (await r.text()).slice(0, 60) };
  } catch (e) {
    out.GET_tasks_err = (e as Error).message;
  }

  // Test 2: raw POST /videos minimal
  try {
    const t0 = Date.now();
    const r = await fetch(base + '/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(mptKey ? { 'x-api-key': mptKey } : {}) },
      body: JSON.stringify({ video_subject: 'raw probe from vercel', video_count: 1, video_clip_duration: 2 }),
      signal: AbortSignal.timeout(15000),
    });
    const txt = await r.text();
    out.POST_videos = { status: r.status, ms: Date.now() - t0, body: txt.slice(0, 60) };
  } catch (e) {
    out.POST_videos_err = (e as Error).name + ' ' + (e as Error).message;
  }

  return NextResponse.json({ ok: true, out });
}