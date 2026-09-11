import { NextResponse } from 'next/server';
import { verifyFirebaseToken, getAdminApp } from '@/lib/verify-token';
import { submitVideoJobServer } from '@/lib/mpt-server';

/**
 * POST /api/generate
 * Server-side video generation entry point.
 * Requires a logged-in Firebase user (Firebase ID token in Authorization header).
 * Submits to MPT with the server-side API key (never exposed to the browser).
 * Also enforces the free-tier credit cap (3 videos/month) as a first gate.
 */
export async function POST(request: Request) {
  // 1. Authenticate the user from the Firebase ID token
  const authHeader = request.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let uid: string;
  try {
    const decoded = await verifyFirebaseToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let params: Record<string, unknown>;
  try {
    params = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // 3. Free-tier credit enforcement (server-side, 3 videos/month)
  try {
    const { checkAndIncrementCredits } = await import('@/lib/server-credits');
    const allowed = await checkAndIncrementCredits(uid);
    if (!allowed) {
      return NextResponse.json({ error: 'Free limit reached (3 videos/month). Upgrade to Pro for unlimited.' }, { status: 402 });
    }
  } catch (e) {
    // If credit check fails, fail closed (do not allow uncapped generation)
    console.warn('[api/generate] credit check failed', e);
    return NextResponse.json({ error: 'Could not verify quota' }, { status: 500 });
  }

  // 4. Submit to MPT with server-side key
  try {
    const { task_id } = await submitVideoJobServer(params);
    return NextResponse.json({ task_id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}