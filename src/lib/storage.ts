import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp } from './firebase';

/**
 * Durably store a finished video in Firebase Storage.
 *
 * Why: MPT keeps finished videos on its own VM disk
 * (/root/MoneyPrinterTurbo/storage/tasks/<taskId>/final-1.mp4). Those paths
 * are lost if the MPT container is rebuilt and are served from a single
 * always-on box. Uploading each finished video to Firebase Storage gives it:
 *   - a permanent URL that survives MPT redeploys
 *   - global CDN delivery (no dependency on the single MPT VM)
 *   - a clean, cacheable public URL we can store in Firestore
 *
 * The MPT stream endpoint sends CORS headers allowing mptsaas.vercel.app,
 * so the browser can fetch the raw bytes and re-upload them to Storage.
 */
export async function uploadVideoToStorage(
  userId: string,
  taskId: string,
  sourceUrl: string
): Promise<string | null> {
  try {
    // 1. Pull the raw bytes from MPT's stream endpoint (CORS-enabled)
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.warn(`[storage] fetch from MPT failed: ${res.status}`);
      return null;
    }
    const blob = await res.blob();

    // 2. Upload to Firebase Storage under videos/<userId>/<taskId>.mp4
    const app = getFirebaseApp();
    const storage = getStorage(app);
    const path = `videos/${userId}/${taskId}.mp4`;
    const storageRef = ref(storage, path);
    const meta = { contentType: blob.type || 'video/mp4' };
    await uploadBytes(storageRef, blob, meta);

    // 3. Return the permanent download URL
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.warn('[storage] upload failed', e instanceof Error ? e.message : e);
    return null;
  }
}