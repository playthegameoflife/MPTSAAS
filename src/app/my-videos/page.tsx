'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, auth, signInWithGoogle, type User } from '@/lib/firebase';
import { getUserVideos, type VideoRecord } from '@/lib/firestore';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin w-6 h-6 text-[#EC4899]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
      </svg>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

function VideoCard({ video }: { video: VideoRecord }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B]/50 overflow-hidden">
      {/* Video preview area */}
      <div className="aspect-video bg-black relative">
        {video.status === 'completed' && video.videoUrl ? (
          <video
            src={video.videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : video.status === 'processing' || video.status === 'queued' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
            <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
            </svg>
            <span className="text-xs">{video.status === 'queued' ? 'Queued...' : 'Processing...'}</span>
          </div>
        ) : video.status === 'failed' ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2">
            <span className="text-2xl">❌</span>
            <span className="text-xs text-red-400/60 px-4 text-center">{video.error ?? 'Generation failed'}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-xs">No preview</div>
        )}
      </div>

      {/* Card info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-white/80 leading-tight line-clamp-2 flex-1">
            {video.topic}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30 mb-3">
          <span>{video.niche}</span>
          <span>·</span>
          <span>{video.aspect}</span>
          <span>·</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
        {video.status === 'completed' && video.videoUrl && (
          <a
            href={video.videoUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#EC4899]/20 hover:bg-[#EC4899]/30 text-[#EC4899] text-xs font-medium transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </a>
        )}
      </div>
    </div>
  );
}

export default function MyVideosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => { setUser(u); setAuthLoading(false); },
      () => { setAuthError(true); setAuthLoading(false); }
    );
    timeout = setTimeout(() => setAuthLoading(false), 5000);
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserVideos(user.uid)
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Spinner /></div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="text-4xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to see your videos</h2>
        <p className="text-white/40 mb-8">Your generated videos will appear here.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Videos</h1>
          <p className="text-white/40 text-sm mt-1">
            {loading ? 'Loading...' : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-[#EC4899] hover:bg-[#DB2777] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          + New video
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">No videos yet</h2>
          <p className="text-white/40 mb-6">Generate your first faceless video.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#EC4899] hover:bg-[#DB2777] text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            Create a video →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
