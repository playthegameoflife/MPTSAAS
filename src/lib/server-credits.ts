import { adminFirestore } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const FREE_LIMIT = 3; // 3 videos per month on the free tier

/**
 * Server-side free-tier credit enforcement.
 * Stores { plan, creditsUsed, creditsMonth } on the user's Firestore doc
 * (/users/{uid}). Grants 3 videos/month on the free plan; Pro users are unlimited.
 * Returns true if a new generation is allowed (and atomically consumes a credit),
 * false if the user has hit the free cap.
 *
 * Fail-closed: throws on any storage error so callers can abort generation.
 */
export async function checkAndIncrementCredits(uid: string): Promise<boolean> {
  const db = adminFirestore();
  const userRef = db.collection('users').doc(uid);
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.exists ? (snap.data() ?? {}) : {};
    const plan = (data.plan as string) ?? 'free';
    const creditsUsed = (data.creditsUsed as number) ?? 0;
    const creditsMonth = (data.creditsMonth as string) ?? '';

    // Pro = unlimited
    if (plan === 'pro') {
      await tx.set(userRef, { plan: 'pro', lastActiveAt: Timestamp.now() }, { merge: true } as any);
      return true;
    }

    // Reset counter if a new month started
    const used = creditsMonth === month ? creditsUsed : 0;
    if (used >= FREE_LIMIT) {
      return false;
    }
    await tx.set(userRef, { plan: 'free', creditsUsed: used + 1, creditsMonth: month, lastActiveAt: Timestamp.now() }, { merge: true } as any);
    return true;
  });
}