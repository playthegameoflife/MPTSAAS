'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  submitVideoJob,
  getVideoTask,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  BGM_TYPES,
  type VideoParams,
} from '@/lib/mpt-service';
import { signInWithGoogle, signOutUser, onAuthStateChanged, auth, type User } from '@/lib/firebase';
import { saveVideoJob, updateVideoJob } from '@/lib/firestore';

// ─── MPT Constants ──────────────────────────────────────────────────────────

const NICHES = ['Finance', 'Fitness', 'Tech', 'Crypto', 'Motivation', 'Lifestyle', 'Business', 'Health'];

const ASPECTS = [
  { label: '9:16 TikTok/Reels', value: '9:16' },
  { label: '16:9 YouTube', value: '16:9' },
  { label: '1:1 Square', value: '1:1' },
];

const LANGUAGES = [
  { id: '', label: 'Auto-detect' },
  { id: 'en', label: 'English' },
  { id: 'zh', label: 'Chinese' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'hi', label: 'Hindi' },
];

const CONCAT_MODES = [
  { id: 'random', label: 'Random order' },
  { id: 'sequential', label: 'Sequential' },
];

const TRANSITION_MODES = [
  { id: '', label: 'None (cut)' },
  { id: 'Shuffle', label: 'Shuffle' },
  { id: 'FadeIn', label: 'Fade In' },
  { id: 'FadeOut', label: 'Fade Out' },
  { id: 'SlideIn', label: 'Slide In' },
];

const SUBTITLE_POSITIONS = [
  { id: 'bottom', label: 'Bottom' },
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'custom', label: 'Custom (%)' },
];

const FONT_OPTIONS = [
  { id: 'STHeitiMedium.ttc', label: 'STHeiti Medium (bold)' },
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Arial', label: 'Arial' },
  { id: 'Times-Roman', label: 'Times Roman' },
  { id: 'Georgia', label: 'Georgia' },
  { id: 'Courier', label: 'Courier' },
  { id: 'Impact', label: 'Impact' },
];

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm">
      <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-10 max-w-md w-full mx-4 text-center">
        <div className="text-4xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to create videos</h2>
        <p className="text-white/50 mb-8">Free 3 videos per month. No credit card required.</p>
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
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

function Spinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-white/50 text-sm">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
      </svg>
      {message}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Core params
  const [topic, setTopic] = useState('');
  const [customScript, setCustomScript] = useState('');
  const [niche, setNiche] = useState('Tech');
  const [aspect, setAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoLanguage, setVideoLanguage] = useState('');

  // Voice params
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.0);

  // BGM params
  const [bgmType, setBgmType] = useState('cinematic');
  const [bgmVolume, setBgmVolume] = useState(0.2);

  // Subtitle params
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitlePosition, setSubtitlePosition] = useState('bottom');
  const [customPosition, setCustomPosition] = useState(70);
  const [fontName, setFontName] = useState('STHeitiMedium.ttc');
  const [fontSize, setFontSize] = useState(60);
  const [textForeColor, setTextForeColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [textBackgroundColor, setTextBackgroundColor] = useState(false);
  const [roundedSubtitleBackground, setRoundedSubtitleBackground] = useState(false);

  // Video params
  const [videoCount, setVideoCount] = useState(1);
  const [videoClipDuration, setVideoClipDuration] = useState(5);
  const [videoClipSpeed, setVideoClipSpeed] = useState(1.0);
  const [concatMode, setConcatMode] = useState('random');
  const [transitionMode, setTransitionMode] = useState('');

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [firestoreDocId, setFirestoreDocId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setAuthLoading(false);
      },
      () => {
        setAuthError(true);
        setAuthLoading(false);
      }
    );
    // Fallback: if onAuthStateChanged never fires (headless), force finish after 5s
    timeout = setTimeout(() => setAuthLoading(false), 5000);
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit() {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setError(null);
    setVideoUrl(null);
    setLoading(true);

    const params: VideoParams = {
      video_subject: topic,
      video_script: customScript || undefined,
      video_aspect: aspect,
      video_language: videoLanguage || undefined,
      voice_name: voice,
      voice_volume: voiceVolume,
      voice_rate: voiceRate,
      bgm_type: bgmType,
      bgm_volume: bgmVolume,
      subtitle_enabled: subtitleEnabled,
      subtitle_position: subtitlePosition,
      custom_position: subtitlePosition === 'custom' ? customPosition : undefined,
      font_name: fontName,
      font_size: fontSize,
      text_fore_color: textForeColor,
      text_background_color: textBackgroundColor || undefined,
      rounded_subtitle_background: roundedSubtitleBackground || undefined,
      stroke_color: strokeColor,
      stroke_width: strokeWidth,
      video_count: videoCount,
      video_clip_duration: videoClipDuration,
      video_clip_speed: videoClipSpeed,
      video_concat_mode: concatMode,
      video_transition_mode: transitionMode || undefined,
    };

    try {
      const { task_id } = await submitVideoJob(params);
      setTaskId(task_id);
      setStatus('queued');

      // Save to Firestore for history
      let docId: string | null = null;
      if (user) {
        try {
          docId = await saveVideoJob({ userId: user.uid, taskId: task_id, topic, niche, aspect });
          setFirestoreDocId(docId);
        } catch (e) {
          console.warn('Failed to save video job to Firestore', e);
        }
      }

      pollTask(task_id, docId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit job');
      setLoading(false);
    }
  }

  async function pollTask(id: string, docId: string | null) {
    const poll = async () => {
      try {
        const task = await getVideoTask(id);
        setStatus(task.status);
        if (task.status === 'completed' && task.video_url) {
          setVideoUrl(task.video_url);
          if (docId) updateVideoJob({ docId, status: 'completed', videoUrl: task.video_url }).catch(console.warn);
          setLoading(false);
          return;
        }
        if (task.status === 'failed') {
          setError(task.error ?? 'Video generation failed');
          if (docId) updateVideoJob({ docId, status: 'failed', error: task.error }).catch(console.warn);
          setLoading(false);
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };
    poll();
  }

  if (authLoading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <Spinner message="Connecting..." />
    </div>
  );

  if (!user) return (
    <>
      <AuthGate onSignIn={signInWithGoogle} />
      {authError && (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <div className="text-white/40 mb-4">Firebase auth requires a real browser. Please open this app in Chrome and try again.</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#EC4899] text-white rounded-lg text-sm cursor-pointer">Retry</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg">
            <Link href="/" className="text-white hover:text-[#EC4899] transition-colors">
              <span className="text-[#EC4899]">Faceless</span>Video.ai
            </Link>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">Create</Link>
            <Link href="/my-videos" className="text-white/60 hover:text-white transition-colors">My Videos</Link>
            <Link href="/account" className="text-white/60 hover:text-white transition-colors">Account</Link>
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName ?? ''} className="w-8 h-8 rounded-full" />
            )}
            <button
              onClick={signOutUser}
              className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Create Video</h1>
          <p className="text-white/40 text-sm">Fill in what you want — the AI handles everything else.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Topic */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <label className="block text-sm font-medium text-white/80 mb-2">Video Topic *</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why index funds beat active trading"
                className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm"
              />
              <p className="text-white/30 text-xs mt-2">The AI will generate a script from this topic</p>
            </div>

            {/* Niche + Aspect */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
                <label className="block text-sm font-medium text-white/80 mb-2">Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm cursor-pointer"
                >
                  {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
                <label className="block text-sm font-medium text-white/80 mb-2">Aspect Ratio</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as '9:16' | '16:9' | '1:1')}
                  className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm cursor-pointer"
                >
                  {ASPECTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            {/* Video count */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Number of videos to generate
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={videoCount}
                  onChange={(e) => setVideoCount(Number(e.target.value))}
                  className="flex-1 accent-[#EC4899]"
                />
                <span className="text-white font-medium w-6 text-right">{videoCount}</span>
              </div>
            </div>

            {/* Voice */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <label className="block text-sm font-medium text-white/80 mb-2">Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm cursor-pointer mb-4"
              >
                {AVAILABLE_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Volume ({voiceVolume.toFixed(1)})</label>
                  <input type="range" min={0} max={1} step={0.1} value={voiceVolume}
                    onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className="w-full accent-[#EC4899]" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Speed ({voiceRate.toFixed(1)}x)</label>
                  <input type="range" min={0.5} max={2} step={0.1} value={voiceRate}
                    onChange={(e) => setVoiceRate(Number(e.target.value))}
                    className="w-full accent-[#EC4899]" />
                </div>
              </div>
            </div>

            {/* BGM */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <label className="block text-sm font-medium text-white/80 mb-2">Background Music</label>
              <select
                value={bgmType}
                onChange={(e) => setBgmType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm cursor-pointer mb-4"
              >
                {BGM_TYPES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              <div>
                <label className="text-xs text-white/40 mb-1 block">BGM Volume ({bgmVolume.toFixed(1)})</label>
                <input type="range" min={0} max={1} step={0.05} value={bgmVolume}
                  onChange={(e) => setBgmVolume(Number(e.target.value))}
                  className="w-full accent-[#EC4899]" />
              </div>
            </div>

            {/* Subtitles */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-white/80">Subtitles / Captions</label>
                <button
                  onClick={() => setSubtitleEnabled(!subtitleEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${subtitleEnabled ? 'bg-[#EC4899]' : 'bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${subtitleEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {subtitleEnabled && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Font</label>
                      <select value={fontName} onChange={(e) => setFontName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm cursor-pointer">
                        {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Font Size ({fontSize}px)</label>
                      <input type="range" min={24} max={120} value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-[#EC4899]" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={textForeColor}
                          onChange={(e) => setTextForeColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                        <input type="text" value={textForeColor}
                          onChange={(e) => setTextForeColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-white text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Stroke Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                        <input type="text" value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-white text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Stroke Width ({strokeWidth})</label>
                      <input type="range" min={0} max={5} step={0.5} value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-full accent-[#EC4899]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Position</label>
                      <select value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm cursor-pointer">
                        {SUBTITLE_POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {subtitlePosition === 'custom' && (
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Custom Position ({customPosition}%)</label>
                      <input type="range" min={0} max={100} value={customPosition}
                        onChange={(e) => setCustomPosition(Number(e.target.value))}
                        className="w-full accent-[#EC4899]" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTextBackgroundColor(!textBackgroundColor)}
                      className={`w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${textBackgroundColor ? 'bg-[#EC4899]' : 'bg-white/20'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${textBackgroundColor ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-white/60">Text background (pill shape)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRoundedSubtitleBackground(!roundedSubtitleBackground)}
                      className={`w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${roundedSubtitleBackground ? 'bg-[#EC4899]' : 'bg-white/20'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${roundedSubtitleBackground ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-white/60">Rounded subtitle background</span>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced */}
            <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-sm font-medium text-white/80 cursor-pointer"
              >
                Advanced Settings
                <svg className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Custom script */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Custom Script (optional — overrides AI generation)</label>
                    <textarea
                      value={customScript}
                      onChange={(e) => setCustomScript(e.target.value)}
                      rows={4}
                      placeholder="Paste your own script here. If empty, AI will generate one from the topic."
                      className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EC4899]/60 transition-colors text-sm resize-none"
                    />
                  </div>

                  {/* Video clip settings */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Clip Duration ({videoClipDuration}s)</label>
                      <input type="range" min={2} max={30} value={videoClipDuration}
                        onChange={(e) => setVideoClipDuration(Number(e.target.value))}
                        className="w-full accent-[#EC4899]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Clip Speed ({videoClipSpeed}x)</label>
                      <input type="range" min={0.5} max={3} step={0.1} value={videoClipSpeed}
                        onChange={(e) => setVideoClipSpeed(Number(e.target.value))}
                        className="w-full accent-[#EC4899]" />
                    </div>
                  </div>

                  {/* Concat + transition */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Clip Order</label>
                      <select value={concatMode} onChange={(e) => setConcatMode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm cursor-pointer">
                        {CONCAT_MODES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Transition</label>
                      <select value={transitionMode} onChange={(e) => setTransitionMode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm cursor-pointer">
                        {TRANSITION_MODES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Video Language</label>
                    <select value={videoLanguage} onChange={(e) => setVideoLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm cursor-pointer">
                      {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Generate */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold bg-[#EC4899] hover:bg-[#DB2777] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-200 cursor-pointer text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                  </svg>
                  Generating...
                </span>
              ) : (
                `Generate ${videoCount > 1 ? `${videoCount} videos` : 'video'} →`
              )}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status */}
            {status && (
              <div className="p-5 rounded-xl border border-white/10 bg-[#1E293B]/50">
                <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">Status</div>
                <div className="flex items-center gap-2">
                  {status === 'completed' ? (
                    <span className="text-[#EC4899] font-medium text-sm">✅ Done</span>
                  ) : status === 'failed' ? (
                    <span className="text-red-400 font-medium text-sm">❌ Failed</span>
                  ) : (
                    <>
                      <svg className="animate-spin w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                      </svg>
                      <span className="text-white/70 text-sm capitalize">{status}...</span>
                    </>
                  )}
                </div>
                {taskId && (
                  <div className="text-xs text-white/30 mt-2 truncate">Task: {taskId}</div>
                )}
              </div>
            )}

            {/* Video output */}
            {videoUrl && (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-[9/16] bg-black object-contain"
                />
                <div className="p-4 bg-[#1E293B]">
                  <a
                    href={videoUrl}
                    download
                    className="block w-full py-2.5 rounded-lg font-medium bg-[#EC4899] hover:bg-[#DB2777] text-white text-sm text-center transition-colors duration-200 cursor-pointer"
                  >
                    Download video
                  </a>
                </div>
              </div>
            )}

            {/* Settings summary */}
            <div className="p-5 rounded-xl border border-white/10 bg-[#1E293B]/50">
              <div className="text-xs text-white/40 mb-3 uppercase tracking-widest">Current Settings</div>
              <div className="space-y-2 text-xs text-white/50">
                <div className="flex justify-between"><span>Topic</span><span className="text-white/70 truncate ml-2">{topic || '—'}</span></div>
                <div className="flex justify-between"><span>Niche</span><span className="text-white/70">{niche}</span></div>
                <div className="flex justify-between"><span>Aspect</span><span className="text-white/70">{aspect}</span></div>
                <div className="flex justify-between"><span>Videos</span><span className="text-white/70">{videoCount}</span></div>
                <div className="flex justify-between"><span>Voice</span><span className="text-white/70 truncate ml-2">{voice}</span></div>
                <div className="flex justify-between"><span>BGM</span><span className="text-white/70">{bgmType}</span></div>
                <div className="flex justify-between"><span>Subtitles</span><span className="text-white/70">{subtitleEnabled ? 'On' : 'Off'}</span></div>
                {subtitleEnabled && (
                  <>
                    <div className="flex justify-between"><span>Font</span><span className="text-white/70 text-xs">{fontName}</span></div>
                    <div className="flex justify-between"><span>Font size</span><span className="text-white/70">{fontSize}px</span></div>
                    <div className="flex justify-between"><span>Text color</span><span className="text-white/70">{textForeColor}</span></div>
                    <div className="flex justify-between"><span>Stroke</span><span className="text-white/70">{strokeColor} × {strokeWidth}</span></div>
                    <div className="flex justify-between"><span>Position</span><span className="text-white/70">{subtitlePosition}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span>Clip duration</span><span className="text-white/70">{videoClipDuration}s</span></div>
                <div className="flex justify-between"><span>Clip speed</span><span className="text-white/70">{videoClipSpeed}x</span></div>
                <div className="flex justify-between"><span>Concat</span><span className="text-white/70">{concatMode}</span></div>
                <div className="flex justify-between"><span>Transition</span><span className="text-white/70">{transitionMode || 'cut'}</span></div>
                <div className="flex justify-between"><span>Language</span><span className="text-white/70">{videoLanguage || 'auto'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
