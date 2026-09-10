'use client';

import AppShell from '@/components/AppShell';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, auth } from '@/lib/firebase';
import { getUserVideos, type VideoRecord } from '@/lib/firestore';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

function StatusBadge({ status }: { status: VideoRecord['status'] }) {
  const config = {
    queued:     { bg: 'var(--bg-overlay)', color: 'var(--fg-tertiary)', label: 'Queued' },
    processing: { bg: 'var(--warning-subtle)', color: 'var(--warning)', label: 'Processing' },
    completed:  { bg: 'var(--success-subtle)', color: 'var(--success)', label: 'Done' },
    failed:     { bg: 'var(--error-subtle)', color: 'var(--error)', label: 'Failed' },
  }[status];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 'var(--radius-full)',
      fontSize: 11, fontWeight: 500,
      background: config.bg, color: config.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {config.label}
    </span>
  );
}

function VideoCard({ video }: { video: VideoRecord }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)', transition: 'box-shadow var(--transition-base)' }}>
      {/* Preview area */}
      <div style={{
        aspectRatio: video.aspect === '9:16' ? '9/16' : video.aspect === '1:1' ? '1/1' : '16/9',
        background: '#000', position: 'relative',
      }}>
        {video.status === 'completed' && video.videoUrl ? (
          <video
            src={video.videoUrl}
            controls
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ) : video.status === 'queued' || video.status === 'processing' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', color: 'var(--fg-tertiary)' }}>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M12 3A9 9 0 0 1 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{video.status === 'queued' ? 'Queued...' : 'Processing...'}</span>
          </div>
        ) : video.status === 'failed' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--error)' }}>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 11, color: 'var(--error)', textAlign: 'center', padding: '0 12px' }}>{video.error ?? 'Generation failed'}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg-tertiary)', fontSize: 12 }}>No preview</div>
        )}
      </div>

      {/* Card info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)', lineHeight: 1.4, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {video.topic}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <StatusBadge status={video.status} />
          <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{video.niche}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: 10 }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{video.aspect}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: 10 }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{formatDate(video.createdAt)}</span>
        </div>

        {video.status === 'completed' && video.videoUrl && (
          <a
            href={video.videoUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: 12, fontWeight: 500, transition: 'background var(--transition-fast)' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5V8.5M3 6L6.5 9.5L10 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 10.5H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Download
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--fg-tertiary)' }}>
          <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 9.5L14 12L10 14.5V9.5Z" fill="currentColor"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 8 }}>No videos yet</h2>
      <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginBottom: 24, maxWidth: 280 }}>
        Generate your first faceless video with AI.
      </p>
      <Link
        href="/dashboard"
        style={{ padding: '10px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, transition: 'background var(--transition-fast)' }}
      >
        Create a video →
      </Link>
    </div>
  );
}

export default function MyVideosPage() {
  const [user, setUser] = useState<import('@/lib/firebase').User | null>(null);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    getUserVideos(user.uid)
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>My Videos</h1>
            <p style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
              {loading ? 'Loading...' : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, transition: 'background var(--transition-fast)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New video
          </Link>
        </div>

        {/* Grid */}
        {!loading && videos.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {!loading && videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
            {loading && (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '16/9', background: 'var(--bg-overlay)' }} />
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 14, background: 'var(--bg-overlay)', borderRadius: 4, width: '75%' }} />
                    <div style={{ height: 12, background: 'var(--bg-overlay)', borderRadius: 4, width: '50%' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppShell>
  );
}
