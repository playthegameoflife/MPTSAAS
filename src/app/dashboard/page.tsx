'use client';

import { useState } from 'react';
import {
  submitVideoJob,
  getVideoTask,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  BGM_TYPES,
} from '@/lib/mpt-service';

const NICHES = ['Finance', 'Fitness', 'Tech', 'Crypto', 'Motivation', 'Lifestyle', 'Business', 'Health'];
const ASPECTS = [
  { label: '9:16 TikTok/Reels', value: '9:16' },
  { label: '16:9 YouTube', value: '16:9' },
  { label: '1:1 Square', value: '1:1' },
];

export default function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="text-lg font-bold">
          <span className="text-emerald-400">Faceless</span>Video.ai
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">3/3 free videos left</span>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition">
            Upgrade to Pro
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
                  onClick={() => setAspect(value)}
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                  disabled={loading}
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* BGM */}
              <div>
                <label className="block text-sm font-medium mb-2">Background music</label>
                <div className="flex flex-wrap gap-2">
                  {BGM_TYPES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgmType(b.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        bgmType === b.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      disabled={loading}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Captions / Subtitles</div>
                  <div className="text-xs text-slate-400">Burned into the video</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubtitleEnabled(!subtitleEnabled)}
                  className={`w-12 h-7 rounded-full transition ${
                    subtitleEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  disabled={loading}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    subtitleEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Font size */}
              {subtitleEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Caption size — {fontSize}px
                  </label>
                  <input
                    type="range"
                    min={24}
                    max={120}
                    step={4}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                    disabled={loading}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none"
          >
            {loading
              ? status === 'queued'
                ? '📋 Queued...'
                : status === 'processing'
                ? '🎬 Generating...'
                : '⏳ Starting...'
              : '🎬 Generate video'}
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
          <div className="mt-6 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-4xl mb-3">
              {status === 'queued' ? '📋' : status === 'processing' ? '🎬' : '⏳'}
            </div>
            <div className="font-medium mb-1">
              {status === 'queued' ? 'Queued for generation' : 'Generating your video...'}
            </div>
            <div className="text-slate-400 text-sm">
              This takes 30–90 seconds. You can leave this page — the video will be ready when you return.
            </div>
          </div>
        )}

        {/* Video output */}
        {videoUrl && (
          <div className="mt-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <video
                src={videoUrl}
                controls
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <a
                href={videoUrl}
                download
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-center rounded-xl font-medium transition"
              >
                ⬇ Download MP4
              </a>
              <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all">
                📱 Post to all platforms
              </button>
            </div>
          </div>
        )}

        {/* History — placeholder, will wire to Supabase */}
        {videoUrl && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Recent videos</h2>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="w-24 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                  Thumb
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{topic}</div>
                  <div className="text-slate-400 text-sm">
                    {niche} · {aspect} · Just now
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs hover:bg-slate-700">
                    Repost
                  </button>
                  <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
