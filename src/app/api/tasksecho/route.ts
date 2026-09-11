import { NextResponse } from 'next/server';

/**
 * POST /api/tasksecho — returns request details untouched.
 * Diagnostic to isolate whether the crash is in OUR handling or at bundle/module level.
 */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    let body: unknown = null;
    try { body = await request.json(); } catch { body = 'no-json'; }
    return NextResponse.json({ ok: true, hasAuth: !!authHeader, body });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}