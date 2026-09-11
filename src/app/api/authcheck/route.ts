import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/verify-token';

/** Isolate: does the jose-based token verifier load + run cleanly on Vercel? */
export async function GET() {
  try {
    // verifyFirebaseToken with a garbage token should throw (rejected), NOT crash the lambda
    await verifyFirebaseToken('garbage-token');
    return NextResponse.json({ ok: true, unexpected: 'token accepted?' });
  } catch (e) {
    const err = e as Error;
    const code = (err as any).code;
    return NextResponse.json({ ok: 'jose-verifier-loaded', rejected: true, module: typeof verifyFirebaseToken, code: code ?? null, msg: err.message?.slice(0, 120) });
  }
}