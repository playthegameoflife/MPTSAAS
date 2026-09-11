/**
 * Server-only MPT client.
 * This runs in /api/* routes (Vercel serverless) so the MPT API key
 * (MPT_API_KEY) and MPT_BASE_URL stay server-side, never shipped to the browser.
 */
import { adminStorage } from './firebase-admin';

const MPT_URL = (process.env.MPT_BASE_URL ?? 'http://76.13.30.74:8080').replace(/\/+$/, '') + '/api/v1';
const MPT_KEY = process.env.MPT_API_KEY ?? '';

async function mptFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (MPT_KEY) headers.set('x-api-key', MPT_KEY);
  if (init?.body) headers.set('Content-Type', 'application/json');
  return fetch(`${MPT_URL}${path}`, { ...init, headers });
}

/** Submit a generation job on the server (with the API key). */
export async function submitVideoJobServer(params: Record<string, unknown>): Promise<{ task_id: string }> {
  const safe = { ...params };
  if (!safe.voice_name || !String(safe.voice_name).trim()) safe.voice_name = 'gemini:Zephyr';
  if (!safe.video_subject || !String(safe.video_subject).trim()) safe.video_subject = 'Untitled video';
  const res = await mptFetch('/videos', { method: 'POST', body: JSON.stringify(safe) });
  if (!res.ok) throw new Error(`[mpt-server] submit failed ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return { task_id: d.data?.task_id ?? d.task_id };
}

/** Poll MPT for task state on the server. */
export async function getVideoTaskServer(taskId: string): Promise<Record<string, unknown>> {
  const res = await mptFetch(`/tasks/${taskId}`);
  if (!res.ok) throw new Error(`[mpt-server] poll failed ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return (d.data ?? d) as Record<string, unknown>;
}

/** Ask MPT to delete a task (removes its local disk copy). */
export async function deleteVideoTaskServer(taskId: string): Promise<void> {
  try {
    const res = await mptFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) console.warn('[mpt-server] cleanup delete failed', res.status);
  } catch (e) {
    console.warn('[mpt-server] cleanup delete error', e);
  }
}

/**
 * Server-side: copy a finished MPT video into the USER's Firebase Storage,
 * then let the caller clean up the VM copy. Returns the permanent storage URL.
 */
export async function storeVideoForUser(
  userId: string,
  taskId: string,
  mptStreamUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(mptStreamUrl, { headers: MPT_KEY ? { 'x-api-key': MPT_KEY } : {} });
    if (!res.ok) {
      console.warn('[mpt-server] fetch video failed', res.status);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const bucket = adminStorage().bucket();
    const file = bucket.file(`videos/${userId}/${taskId}.mp4`);
    await file.save(buf, { contentType: 'video/mp4', resumable: false, public: true });
    // Public download URL for playback
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`videos/${userId}/${taskId}.mp4`)}?alt=media`;
    return url;
  } catch (e) {
    console.warn('[mpt-server] store video error', e);
    return null;
  }
}