import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';
import { getVideoTaskServer, storeVideoForUser, deleteVideoTaskServer } from '@/lib/mpt-server';

/**
 * GET /api/tasks/[taskId]
 * Server-side task poll. Works EXACTLY like the old client-side poll but:
 *  - authenticates the user (Firebase ID token)
 *  - on completion, fetches the finished video from MPT, uploads it to the
 *    USER's Firebase Storage, then asks MPT to delete its local VM copy.
 * Returns { status, progress, video_url (permanent storage URL), error }.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const authHeader = request.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAuth(getAdminApp()).verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task = await getVideoTaskServer(taskId);
    const state = task.state as number; // -1 fail, 1 processing, 2 done
    const status = state === 2 ? 'completed' : state === -1 ? 'failed' : 'processing';

    // Only act on terminal completed
    if (status === 'completed') {
      const vids = (task.videos as string[]) ?? [];
      if (vids.length) {
        // Build the stream URL the server can fetch (with the key)
        const mptBase = (process.env.MPT_BASE_URL ?? 'http://76.13.30.74:8080').replace(/\/+$/, '') + '/api/v1';
        const mptKey = process.env.MPT_API_KEY ?? '';
        const path = vids[0].startsWith('/') ? vids[0] : `/${vids[0]}`;
        const encPath = encodeURIComponent(path);
        const streamUrl = `${mptBase}/stream/${encPath}`;
        const headers: Record<string, string> = mptKey ? { 'x-api-key': mptKey } : {};

        // Upload a copy into the USER's Firebase Storage
        const storedUrl = await storeVideoForUser(uid, taskId, streamUrl);
        const videoUrl = storedUrl ?? streamUrl; // fall back to MPT stream if upload fails

        // Clean up the MPT VM local copy now that we have a durable copy
        if (storedUrl) {
          await deleteVideoTaskServer(taskId);
        }

        return NextResponse.json({ task_id: taskId, status: 'completed', video_url: videoUrl, progress: 100 });
      }
    }

    if (status === 'failed') {
      return NextResponse.json({ task_id: taskId, status: 'failed', error: String(task.error ?? 'Generation failed') });
    }

    return NextResponse.json({ task_id: taskId, status, progress: task.progress ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}