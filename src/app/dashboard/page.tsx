'use client';

import { useState, useEffect } from 'react';
import {
  submitVideoJob,
  getVideoTask,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  BGM_TYPES,
} from '@/lib/mpt-service';
import { signInWithGoogle, signOutUser, onAuthStateChanged, type User } from '@/lib/firebase';

const NICHES = ['Finance', 'Fitness', 'Tech', 'Crypto', 'Motivation', 'Lifestyle', 'Business', 'Health'];
const ASPECTS = [
  { label: '9:16 TikTok/Reels', value: '9:16' },
  { label: '16:9 YouTube', value: '16:9' },
  { label: '1:1 Square', value: '1:1' as const },
];

// Auth gate — shown when user is not signed in
function AuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-md w-full mx-4 text-center">
        <div className="text-3xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to create videos</h2>
        <p className="text-slate-400 mb-8">
          Free 3 videos per month. No credit card required.
        </p>
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition"
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
}

// Loading spinner
function Spinner() {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
      </svg>
      Signing in...
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Tech');
  const [aspect, setAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced options
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [bgmType, setBgmType] = useState('cinematic');
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(60);

  // State
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Firebase auth listener — onAuthStateChanged(auth, observer, error, completed)
  // Add a 5s fallback timeout so the UI never gets stuck if Firebase fails silently
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          setUser(u);
          setAuthLoading(false);
        },
        (error) => {
          console.error('[Firebase Auth]', error.code, error.message);
          window.__authError = error;
          setAuthLoading(false);
        }
      );
    } catch (err) {
      console.error('[Firebase Init]', err);
      setAuthLoading(false);
    }

    // Fallback: if Firebase doesn't resolve in 5s, show the auth gate anyway
    timeout = setTimeout(() => {
      setAuthLoading(false);
    }, 5000);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    setVideoUrl(null);
    setTaskId(null);
    setStatus(null);
    setError(null);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus(null);

    try {
      const res = await submitVideoJob({
        video_subject: topic.trim(),
        video_aspect: aspect,
        video_language: 'auto',
        subtitle_enabled: subtitleEnabled,
        font_size: fontSize,
        text_fore_color: '#FFFFFF',
        stroke_color: '#000000',
        video_count: 1,
        voice_name: voice,
        bgm_type: bgmType,
      });

      setTaskId(res.task_id);
      setStatus('queued');
      pollTask(res.task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setLoading(false);
    }
  }

  async function pollTask(id: string) {
    const poll = async () => {
      try {
        const res = await getVideoTask(id);
        setStatus(res.status);
        if (res.status === 'completed' && res.video_url) {
          setVideoUrl(res.video_url);
          setLoading(false);
          return;
        }
        if (res.status === 'failed') {
          setError(res.error ?? 'Video generation failed. Please try again.');
          setLoading(false);
          return;
        }
        if (res.status === 'queued' || res.status === 'processing') {
          setTimeout(poll, 3000);
        }
      } catch {
        setTimeout(poll, 5000);
      }
    };
    poll();
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Show auth gate if not signed in
  if (!user) {
    return <AuthGate onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="text-lg font-bold">
          <span className="text-emerald-400">Faceless</span>Video.ai
        </div>
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-slate-400 hidden sm:block">{user.email}</span>
          <span className="text-sm text-emerald-400 font-medium">3/3 free videos</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-bold mb-2">Create a new video</h1>
        <p className="text-slate-400 mb-8">
          Enter a topic and we&apos;ll generate a complete faceless video in 60 seconds.
        </p>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-2">Video topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why index funds beat active trading in 2025"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              disabled={loading}
            />
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium mb-2">Niche template</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNiche(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    niche === n
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  disabled={loading}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="block text-sm font-medium mb-2">Aspect ratio</label>
            <div className="flex gap-3">
              {ASPECTS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAspect(value as '9:16' | '16:9' | '1:1')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition ${
                    aspect === value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}
                  disabled={loading}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-slate-400 hover:text-white transition flex items-center gap-2"
          >
            <span className="text-emerald-400">{showAdvanced ? '−' : '+'}</span>
            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          </button>

          {/* Advanced panel */}
          {showAdvanced && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
              {/* Voice */}
              <div>
                <label className="block text-sm font-medium mb-2">Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* BGM */}
              <div>
                <label className="block text-sm font-medium mb-2">Background music</label>
                <select
                  value={bgmType}
                  onChange={(e) => setBgmType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {BGM_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle size: {fontSize}px</label>
                <input
                  type="range"
                  min={40}
                  max={80}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Subtitles toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="subtitles"
                  checked={subtitleEnabled}
                  onChange={(e) => setSubtitleEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="subtitles" className="text-sm">Burn in subtitles</label>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-lg rounded-xl transition"
          >
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Status */}
        {status && !videoUrl && !error && (
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                {status === 'queued' && 'Queued — generation starts shortly...'}
                {status === 'processing' && 'Generating your video...'}
              </span>
            </div>
            {taskId && (
              <p className="text-xs text-slate-500 mt-2">Task ID: {taskId}</p>
            )}
          </div>
        )}

        {/* Video output */}
        {videoUrl && (
          <div className="mt-8 p-6 bg-slate-900 border border-emerald-500/30 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Your video is ready!</h3>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '500px' }}
            />
            <a
              href={videoUrl}
              download
              className="mt-4 inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
