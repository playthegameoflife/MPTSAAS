import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

// Re-export user type
export type { User } from './firebase';

// ─── Init ────────────────────────────────────────────────────────────────────

let _db: ReturnType<typeof getFirestore> | null = null;
function getDb() {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VideoRecord {
  id: string;
  taskId: string;
  topic: string;
  niche: string;
  aspect: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
}

// ─── Operations ──────────────────────────────────────────────────────────────

/**
 * Save a new video job to the user's video history.
 * Call this right after submitting the job to MPT.
 */
export async function saveVideoJob(params: {
  userId: string;
  taskId: string;
  topic: string;
  niche: string;
  aspect: string;
}): Promise<string> {
  const db = getDb();
  const col = collection(db, 'videos');
  const docRef = await addDoc(col, {
    userId: params.userId,
    taskId: params.taskId,
    topic: params.topic,
    niche: params.niche,
    aspect: params.aspect,
    status: 'queued',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Update a video record's status and URL after polling completes.
 */
export async function updateVideoJob(params: {
  docId: string;
  status: VideoRecord['status'];
  videoUrl?: string;
  error?: string;
}): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'videos', params.docId);
  await import('firebase/firestore').then(({ updateDoc }) =>
    updateDoc(docRef, {
      status: params.status,
      ...(params.videoUrl ? { videoUrl: params.videoUrl } : {}),
      ...(params.error ? { error: params.error } : {}),
    })
  );
}

/**
 * Get all videos for a user, newest first.
 */
export async function getUserVideos(userId: string): Promise<VideoRecord[]> {
  const db = getDb();
  const col = collection(db, 'videos');
  const q = query(
    col,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      taskId: data.taskId,
      topic: data.topic,
      niche: data.niche,
      aspect: data.aspect,
      status: data.status,
      videoUrl: data.videoUrl,
      error: data.error,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    } as VideoRecord;
  });
}
