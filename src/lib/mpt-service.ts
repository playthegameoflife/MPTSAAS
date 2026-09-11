/**
 * MoneyPrinterTurbo Black-Box Service
 * ====================================
 * This module is the ONLY place in the codebase that talks to MPT.
 * MPT is a completely external, immutable service — we never modify it.
 *
 * Architecture:
 *   MPTSAAS (your SaaS)  ----HTTP---->  MPT Engine (black box, runs elsewhere)
 *                                      (Render / Modal / VPS / GPU machine)
 *
 * Rules:
 *   1. Never import MPT source code into this repo
 *   2. Never run MPT as a subprocess from MPTSAAS
 *   3. All communication is via the MPT REST API only
 *   4. Pin MPT to a specific Docker image tag in your deployment
 */

// ---------------------------------------------------------------------------
// Types — these mirror MPT's API contract (read-only, never derived from MPT code)
// ---------------------------------------------------------------------------

export interface VideoParams {
  video_subject: string;
  video_script?: string;
  video_aspect?: '9:16' | '16:9' | '1:1';
  video_language?: string;
  voice_name?: string;
  voice_volume?: number;
  voice_rate?: number;
  bgm_type?: string;
  bgm_volume?: number;
  subtitle_enabled?: boolean;
  subtitle_position?: string;
  custom_position?: number;
  font_name?: string;
  font_size?: number;
  text_fore_color?: string;
  text_background_color?: boolean | string;
  rounded_subtitle_background?: boolean;
  stroke_color?: string;
  stroke_width?: number;
  video_count?: number;
  video_clip_duration?: number;
  video_clip_speed?: number;
  video_concat_mode?: string;
  video_transition_mode?: string;
  custom_system_prompt?: string;
  video_script_prompt?: string;
}

export interface VideoTask {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videos?: string[];           // MPT relative paths, e.g. ["/tasks/.../final-1.mp4"]
  combined_videos?: string[];
  video_url?: string;          // constructed full URL (for backward compat)
  progress?: number;           // real MPT progress 0-100 (from TaskStatusData.progress)
  failed_stage?: string;       // which stage failed, e.g. "audio" (from failed_stage)
  created_at?: string;
  video_subject?: string;
  error?: string;
}

// -----------------------------------------------------------------------
// Internal config — endpoint comes from env, never hardcoded
// NOTE: read at call time (runtime), not module-load time (build).
// -----------------------------------------------------------------------

function getBaseUrl(): string {
  // NOTE: NEXT_PUBLIC_ prefix makes this available in browser JavaScript
  const MPT_BASE_URL = process.env.NEXT_PUBLIC_MPT_BASE_URL;
  if (!MPT_BASE_URL) {
    throw new Error(
      '[MPT Service] NEXT_PUBLIC_MPT_BASE_URL is not set. ' +
      'MPT is a black-box external service. ' +
      'Set NEXT_PUBLIC_MPT_BASE_URL in your .env to the MPT engine URL (e.g. https://mpt.yourdomain.com/api/v1).'
    );
  }
  return MPT_BASE_URL;
}

// ---------------------------------------------------------------------------
// Public API — these are the ONLY functions that should call MPT
// ---------------------------------------------------------------------------

/**
 * Submit a video generation job to MPT.
 * Returns a task_id for polling.
 *
 * MPT handles: script generation, stock footage, TTS, subtitles, BGM, FFmpeg assembly.
 * We only handle: scheduling, storage, billing.
 */
export async function submitVideoJob(params: VideoParams): Promise<{ task_id: string }> {
  // Guard: MPT hard-fails the audio stage if voice_name is empty
  // (Invalid voice ''), and it does NOT fall back to its config default.
  // Never allow an empty voice through — default to gemini:Zephyr.
  const safeParams: VideoParams = { ...params };
  if (!safeParams.voice_name || !safeParams.voice_name.trim()) {
    safeParams.voice_name = DEFAULT_VOICE;
  }
  // Also guard video_subject (required for script generation).
  if (!safeParams.video_subject.trim()) {
    safeParams.video_subject = 'Untitled video';
  }

  const url = `${getBaseUrl()}/videos`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(safeParams),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[MPT Service] submitVideoJob failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { task_id: data.data?.task_id ?? data.task_id };
}

/**
 * Poll MPT for a task's current status.
 * We never inspect MPT internals — just the status + output URL.
 */
export async function getVideoTask(taskId: string): Promise<VideoTask> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/tasks/${taskId}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[MPT Service] getVideoTask failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const task: VideoTask = data.data ?? data;

  // Normalize MPT's wire format -> our VideoTask shape.
  // MPT sends `state` as an int and `progress` as 0-100:
  //   state: -1 = failed, 0 = queued, 1 = processing, 2 = completed
  if (typeof task.status !== 'string') {
    const raw = data.data ?? data;
    const st = raw.state as number;
    task.status = st === 2 ? 'completed' : st === -1 ? 'failed' : st === 1 ? 'processing' : 'queued';
  }
  // Pull real progress + failed_stage through from the wire payload
  if (typeof task.progress !== 'number') {
    const p = (data.data ?? data).progress;
    task.progress = typeof p === 'number' ? p : undefined;
  }
  if (!task.failed_stage) {
    task.failed_stage = (data.data ?? data).failed_stage;
  }
  if (!task.error) {
    task.error = (data.data ?? data).error;
  }

  // Construct full video URLs from MPT's relative paths.
  // MPT returns an absolute server path, e.g.
  //   /root/MoneyPrinterTurbo/storage/tasks/<id>/final-1.mp4
  // The raw filesystem path is NOT servable via baseUrl + path (404).
  // MPT exposes /api/v1/stream/<file_path> which serves the file correctly.
  // baseUrl may or may not include the /api/v1 prefix, so normalize it.
  if (task.videos?.length && !task.video_url) {
    const serverPath = task.videos[0];
    const fp = serverPath.startsWith('/') ? serverPath : `/${serverPath}`;
    // Normalize: strip trailing slash, then ensure /api/v1 is present once.
    let root = baseUrl.replace(/\/+$/, '');
    if (!/\/api\/v1\/?$/.test(root)) {
      root = `${root}/api/v1`;
    }
    task.video_url = `${root}/stream${fp}`;
  }

  return task;
}

// ---------------------------------------------------------------------------
// Constants — safe defaults that work without exposing MPT internals
// ---------------------------------------------------------------------------

/** Default voice if the user doesn't pick one. Keep in sync with MPT docs, not MPT code. */
export const DEFAULT_VOICE = 'gemini:Zephyr';

/** Available voices — populated from MPT documentation, NOT derived from MPT source. */
export const AVAILABLE_VOICES = [
  { id: 'gemini:Zephyr', label: 'Zephyr (neutral, clear)' },
  { id: 'gemini:Puck', label: 'Puck (energetic, upbeat)' },
  { id: 'gemini:Kore', label: 'Kore (deep, authoritative)' },
  { id: 'gemini:Ember', label: 'Ember (warm, friendly)' },
  { id: 'gemini:Flash', label: 'Flash (fast, punchy)' },
  { id: 'elevenlabs:adam', label: 'Adam (American, deep)' },
  { id: 'elevenlabs:bella', label: 'Bella (American, warm)' },
] as const;

/** BGM types — match MPT's accepted values from its API docs. */
export const BGM_TYPES = [
  { id: 'none', label: 'No music' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'upbeat', label: 'Upbeat' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'tech', label: 'Tech / Corporate' },
  { id: 'motivation', label: 'Motivation' },
] as const;
