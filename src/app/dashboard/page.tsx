'use client';

import AppShell from '@/components/AppShell';
import {
  submitVideoJob,
  getVideoTask,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  BGM_TYPES,
  type VideoParams,
} from '@/lib/mpt-service';
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

// ─── Generation Steps ─────────────────────────────────────────────────────────

type GenerationStep =
  | 'queued'
  | 'writing_script'
  | 'finding_footage'
  | 'generating_voiceover'
  | 'adding_subtitles'
  | 'adding_music'
  | 'assembling_video'
  | 'completed'
  | 'failed';

const STEPS: { key: GenerationStep; label: string; description: string }[] = [
  { key: 'writing_script',        label: 'Writing script',         description: 'Crafting engaging narration with AI' },
  { key: 'finding_footage',       label: 'Finding stock footage',  description: 'Searching Pixabay for matching clips' },
  { key: 'generating_voiceover',  label: 'Generating voiceover',   description: 'Rendering natural TTS narration' },
  { key: 'adding_subtitles',      label: 'Adding subtitles',       description: 'Encoding burned-in captions' },
  { key: 'adding_music',          label: 'Adding background music', description: 'Mixing royalty-free soundtrack' },
  { key: 'assembling_video',      label: 'Assembling final video', description: 'Compositing and encoding output' },
];

function stepIndex(status: GenerationStep): number {
  if (status === 'queued') return -1;
  const idx = STEPS.findIndex(s => s.key === status);
  return idx;
}

function getVisibleSteps(currentStatus: GenerationStep): { step: typeof STEPS[0]; state: 'done' | 'active' | 'pending' }[] {
  const current = stepIndex(currentStatus);
  return STEPS.map((step, i) => ({
    step,
    state: currentStatus === 'failed' && i > current
      ? 'pending'
      : i < current ? 'done' : i === current ? 'active' : 'pending',
  }));
}

/**
 * Map MPT's real progress (0-100) onto the visible step order.
 * We don't know MPT's per-stage split, so we divide the timeline evenly across
 * the 6 steps. The progress bar itself uses the raw real value.
 */
function stepIndexForProgress(pct: number): number {
  if (pct >= 100) return STEPS.length;
  const width = 100 / STEPS.length;
  return Math.min(STEPS.length - 1, Math.max(0, Math.floor(pct / width)));
}

function stepKeyForProgress(pct: number): GenerationStep {
  const idx = stepIndexForProgress(pct);
  return idx >= STEPS.length ? 'assembling_video' : STEPS[idx].key;
}

// ─── Progress Step Component ─────────────────────────────────────────────────

function StepItem({ step, state }: { step: typeof STEPS[0]; state: 'done' | 'active' | 'pending' }) {
  const bg = state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--bg-overlay)';
  const color = state === 'done' || state === 'active' ? '#fff' : 'var(--fg-tertiary)';
  const borderColor = state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--border)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Circle */}
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: bg,
        border: `2px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all var(--transition-base)',
      }}>
        {state === 'done' ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : state === 'active' ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="spin">
            <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-tertiary)' }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: state === 'active' ? 500 : 400, color: state === 'pending' ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }}>
          {step.label}
        </div>
        {state === 'active' && (
          <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 2 }}>
            {step.description}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // Core params
  const [topic, setTopic] = React.useState('');
  const [customScript, setCustomScript] = React.useState('');
  const [niche, setNiche] = React.useState('Tech');
  const [aspect, setAspect] = React.useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoLanguage, setVideoLanguage] = React.useState('');

  // Voice params
  const [voice, setVoice] = React.useState(DEFAULT_VOICE);
  const [voiceVolume, setVoiceVolume] = React.useState(1.0);
  const [voiceRate, setVoiceRate] = React.useState(1.0);

  // BGM params
  const [bgmType, setBgmType] = React.useState('cinematic');
  const [bgmVolume, setBgmVolume] = React.useState(0.2);

  // Subtitle params
  const [subtitleEnabled, setSubtitleEnabled] = React.useState(true);
  const [subtitlePosition, setSubtitlePosition] = React.useState('bottom');
  const [customPosition, setCustomPosition] = React.useState(70);
  const [fontName, setFontName] = React.useState('STHeitiMedium.ttc');
  const [fontSize, setFontSize] = React.useState(60);
  const [textForeColor, setTextForeColor] = React.useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = React.useState('#000000');
  const [strokeWidth, setStrokeWidth] = React.useState(1.5);
  const [textBackgroundColor, setTextBackgroundColor] = React.useState(false);
  const [roundedSubtitleBackground, setRoundedSubtitleBackground] = React.useState(false);

  // Video params
  const [videoCount, setVideoCount] = React.useState(1);
  const [videoClipDuration, setVideoClipDuration] = React.useState(5);
  const [videoClipSpeed, setVideoClipSpeed] = React.useState(1.0);
  const [concatMode, setConcatMode] = React.useState('random');
  const [transitionMode, setTransitionMode] = React.useState('');

  // UI state
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const [firestoreDocId, setFirestoreDocId] = React.useState<string | null>(null);
  const [genStatus, setGenStatus] = React.useState<GenerationStep>('queued');
  const [progressPct, setProgressPct] = React.useState(0);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit() {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setError(null);
    setVideoUrl(null);
    setLoading(true);
    setGenStatus('queued');
    setProgressPct(0);

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
      setGenStatus('writing_script');

      let docId: string | null = null;
      try {
        const { auth } = await import('@/lib/firebase');
        const { getAuth } = await import('firebase/auth');
        const user = getAuth(auth.app);
        if (user?.currentUser) {
          docId = await saveVideoJob({ userId: user.currentUser.uid, taskId: task_id, topic, niche, aspect });
          setFirestoreDocId(docId);
        }
      } catch (e) {
        console.warn('Firestore save failed', e);
      }

      pollTask(task_id, docId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit job');
      setLoading(false);
    }
  }

  async function pollTask(id: string, docId: string | null) {
    // Timer-only fallback (used only if MPT never reports a progress number).
    const advance = () => {
      setGenStatus(prev => {
        const order: GenerationStep[] = ['queued', 'writing_script', 'finding_footage', 'generating_voiceover', 'adding_subtitles', 'adding_music', 'assembling_video'];
        const idx = order.indexOf(prev);
        return idx < order.length - 1 ? order[idx + 1] : prev;
      });
    };

    const poll = async () => {
      try {
        const task = await getVideoTask(id);
        // Terminal states — real, driven by MPT
        if (task.status === 'completed' && (task.video_url || task.videos?.length)) {
          if (!task.video_url) task.video_url = task.videos![0];
          setGenStatus('completed');
          setProgressPct(100);
          const mptUrl = task.video_url;
          // Durably store the finished video in Firebase Storage, then persist
          // the permanent URL (fall back to the MPT URL if upload fails).
          setVideoUrl(mptUrl); // show immediately; swap to storage URL if saved
          if (docId) {
            const { uploadVideoToStorage } = await import('@/lib/storage');
            const { auth } = await import('@/lib/firebase');
            const { getAuth } = await import('firebase/auth');
            const cur = getAuth(auth.app).currentUser;
            if (cur) {
              const storedUrl = await uploadVideoToStorage(cur.uid, id, mptUrl);
              if (storedUrl) {
                setVideoUrl(storedUrl);
                updateVideoJob({ docId, status: 'completed', videoUrl: storedUrl }).catch(console.warn);
              } else {
                updateVideoJob({ docId, status: 'completed', videoUrl: mptUrl }).catch(console.warn);
              }
            } else {
              updateVideoJob({ docId, status: 'completed', videoUrl: mptUrl }).catch(console.warn);
            }
          }
          setLoading(false);
          return;
        }
        if (task.status === 'failed') {
          setGenStatus('failed');
          setError(task.error ?? (task.failed_stage ? `Failed during ${task.failed_stage}` : 'Video generation failed'));
          if (docId) updateVideoJob({ docId, status: 'failed', error: task.error }).catch(console.warn);
          setLoading(false);
          return;
        }
        // Live progress when MPT reports it (real 0-100), else keep timer fallback
        if (typeof task.progress === 'number' && task.progress >= 0) {
          setProgressPct(task.progress);
          setGenStatus(stepKeyForProgress(task.progress));
        } else {
          advance();
        }
        setTimeout(poll, 3500);
      } catch {
        setTimeout(poll, 5000);
      }
    };
    // Kick off first poll
    setTimeout(poll, 3500);
  }

  const visibleSteps = getVisibleSteps(genStatus);
  const isGenerating = loading && genStatus !== 'completed' && genStatus !== 'failed';

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>Create Video</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>Fill in what you want — the AI handles everything else.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── Left: Form ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Topic */}
            <Card>
              <Label>Video Topic *</Label>
              <Input
                value={topic}
                onChange={(v) => setTopic(v)}
                placeholder="e.g. Why index funds beat active trading"
              />
              <Caption>The AI will generate a script from this topic.</Caption>
            </Card>

            {/* Niche + Aspect */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Card>
                <Label>Niche</Label>
                <Select value={niche} onChange={(v) => setNiche(v)}>
                  {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Card>
              <Card>
                <Label>Aspect Ratio</Label>
                <Select value={aspect} onChange={(v) => setAspect(v as typeof aspect)}>
                  {ASPECTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </Select>
              </Card>
            </div>

            {/* Video count */}
            <Card>
              <Label>Number of videos to generate</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input
                  type="range" min={1} max={10} value={videoCount}
                  onChange={(e) => setVideoCount(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, width: 20, textAlign: 'right', color: 'var(--fg-primary)' }}>{videoCount}</span>
              </div>
            </Card>

            {/* Voice */}
            <Card>
              <Label>Voice</Label>
              <Select value={voice} onChange={(v) => setVoice(v)}>
                {AVAILABLE_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </Select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                <SliderRow label={`Volume (${voiceVolume.toFixed(1)})`} value={voiceVolume} min={0} max={1} step={0.1} onChange={(v) => setVoiceVolume(v)} />
                <SliderRow label={`Speed (${voiceRate.toFixed(1)}x)`} value={voiceRate} min={0.5} max={2} step={0.1} onChange={(v) => setVoiceRate(v)} />
              </div>
            </Card>

            {/* BGM */}
            <Card>
              <Label>Background Music</Label>
              <Select value={bgmType} onChange={(v) => setBgmType(v)}>
                {BGM_TYPES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </Select>
              <div style={{ marginTop: 14 }}>
                <SliderRow label={`BGM Volume (${bgmVolume.toFixed(2)})`} value={bgmVolume} min={0} max={1} step={0.05} onChange={(v) => setBgmVolume(v)} />
              </div>
            </Card>

            {/* Subtitles */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitleEnabled ? 16 : 0 }}>
                <Label style={{ margin: 0 }}>Subtitles / Captions</Label>
                <Toggle enabled={subtitleEnabled} onChange={() => setSubtitleEnabled(!subtitleEnabled)} />
              </div>

              {subtitleEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Caption>Font</Caption>
                      <Select value={fontName} onChange={(v) => setFontName(v)}>
                        {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </Select>
                    </div>
                    <SliderRow label={`Font Size (${fontSize}px)`} value={fontSize} min={24} max={120} step={2} onChange={(v) => setFontSize(v)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <ColorRow label="Text Color" value={textForeColor} onChange={(v) => setTextForeColor(v)} />
                    <ColorRow label="Stroke Color" value={strokeColor} onChange={(v) => setStrokeColor(v)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <SliderRow label={`Stroke Width (${strokeWidth})`} value={strokeWidth} min={0} max={5} step={0.5} onChange={(v) => setStrokeWidth(v)} />
                    <div>
                      <Caption>Position</Caption>
                      <Select value={subtitlePosition} onChange={(v) => setSubtitlePosition(v)}>
                        {SUBTITLE_POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </Select>
                    </div>
                  </div>
                  {subtitlePosition === 'custom' && (
                    <SliderRow label={`Custom Position (${customPosition}%)`} value={customPosition} min={0} max={100} step={1} onChange={(v) => setCustomPosition(v)} />
                  )}
                  <ToggleRow label="Text background (pill shape)" enabled={textBackgroundColor} onChange={() => setTextBackgroundColor(!textBackgroundColor)} />
                  <ToggleRow label="Rounded subtitle background" enabled={roundedSubtitleBackground} onChange={() => setRoundedSubtitleBackground(!roundedSubtitleBackground)} />
                </div>
              )}
            </Card>

            {/* Advanced */}
            <Card>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)' }}
              >
                Advanced Settings
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }}>
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showAdvanced && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <Caption>Custom Script (optional — overrides AI generation)</Caption>
                    <textarea
                      value={customScript}
                      onChange={(e) => setCustomScript(e.target.value)}
                      rows={4}
                      placeholder="Paste your own script here. If empty, AI will generate one from the topic."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--fg-primary)', resize: 'none', fontFamily: 'inherit', outline: 'none', transition: 'border-color var(--transition-fast)' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <SliderRow label={`Clip Duration (${videoClipDuration}s)`} value={videoClipDuration} min={2} max={30} step={1} onChange={(v) => setVideoClipDuration(v)} />
                    <SliderRow label={`Clip Speed (${videoClipSpeed}x)`} value={videoClipSpeed} min={0.5} max={3} step={0.1} onChange={(v) => setVideoClipSpeed(v)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Caption>Clip Order</Caption>
                      <Select value={concatMode} onChange={(v) => setConcatMode(v)}>
                        {CONCAT_MODES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Caption>Transition</Caption>
                      <Select value={transitionMode} onChange={(v) => setTransitionMode(v)}>
                        {TRANSITION_MODES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Caption>Video Language</Caption>
                    <Select value={videoLanguage} onChange={(v) => setVideoLanguage(v)}>
                      {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </Select>
                  </div>
                </div>
              )}
            </Card>

            {/* Error */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--error-subtle)', border: '1px solid var(--error)', color: 'var(--error)', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px 24px', borderRadius: 'var(--radius-lg)',
                background: loading ? 'var(--bg-overlay)' : 'var(--accent)', color: '#fff',
                fontSize: 15, fontWeight: 500, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background var(--transition-fast)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M8 2A6 6 0 0 1 14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {`Generate ${videoCount > 1 ? `${videoCount} videos` : 'video'}`}
                </>
              )}
            </button>
          </div>

          {/* ── Right: Progress + Preview ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 'calc(var(--topbar-height) + 24px)' }}>

            {/* Generation progress */}
            {isGenerating && (
              <div style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>Generating your video</h3>
                <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginBottom: 24 }}>This takes about 60 seconds</p>

                {/* Real progress bar driven by MPT progress */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                    <div style={{ height: 8, width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 1s linear' }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--fg-tertiary)', fontWeight: 500 }}>{Math.min(99, Math.max(0, Math.round(progressPct)))}%</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {visibleSteps.map(({ step, state }) => (
                    <StepItem key={step.key} step={step} state={state} />
                  ))}
                </div>

                {taskId && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Task: {taskId}
                  </div>
                )}
              </div>
            )}

            {/* Completed state — inline video */}
            {genStatus === 'completed' && videoUrl && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', aspectRatio: aspect === '9:16' ? '9/16' : aspect === '1:1' ? '1/1' : '16/9', background: '#000', display: 'block' }}
                />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>Video ready</span>
                  </div>
                  <a
                    href={videoUrl}
                    download
                    style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textAlign: 'center', transition: 'background var(--transition-fast)' }}
                  >
                    Download video
                  </a>
                </div>
              </div>
            )}

            {/* Settings summary */}
            <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 16 }}>Current Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Topic', value: topic || '—' },
                  { label: 'Niche', value: niche },
                  { label: 'Aspect', value: aspect },
                  { label: 'Videos', value: String(videoCount) },
                  { label: 'Voice', value: voice },
                  { label: 'BGM', value: bgmType },
                  { label: 'Subtitles', value: subtitleEnabled ? 'On' : 'Off' },
                  ...(subtitleEnabled ? [
                    { label: 'Font size', value: `${fontSize}px` },
                    { label: 'Position', value: subtitlePosition },
                  ] : []),
                  { label: 'Clip duration', value: `${videoClipDuration}s` },
                  { label: 'Clip speed', value: `${videoClipSpeed}x` },
                  { label: 'Concat', value: concatMode },
                  { label: 'Transition', value: transitionMode || 'cut' },
                  { label: 'Language', value: videoLanguage || 'auto' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--fg-tertiary)' }}>{label}</span>
                    <span style={{ color: 'var(--fg-secondary)', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
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

// ─── Shared UI primitives ─────────────────────────────────────────────────────

import React from 'react';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
      {children}
    </div>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)', marginBottom: 8, ...style }}>
      {children}
    </label>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginBottom: 8, marginTop: 4 }}>
      {children}
    </p>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--fg-primary)', outline: 'none', transition: 'border-color var(--transition-fast)', fontFamily: 'inherit' }}
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--fg-primary)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      {children}
    </select>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginBottom: 6 }}>{label}</div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color" value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 32, padding: 2, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }}
        />
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 12, color: 'var(--fg-primary)', fontFamily: 'var(--font-mono)', outline: 'none' }}
        />
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 11, background: enabled ? 'var(--accent)' : 'var(--bg-overlay)',
        border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border-strong)'}`,
        position: 'relative', transition: 'all var(--transition-fast)', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: enabled ? '#fff' : 'var(--fg-tertiary)',
        position: 'absolute', top: 3, transition: 'left var(--transition-fast)',
        left: enabled ? 22 : 3,
      }} />
    </button>
  );
}

function ToggleRow({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{label}</span>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}
