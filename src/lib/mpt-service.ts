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
  video_url?: string;
  created_at?: string;
  video_subject?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Internal config — endpoint comes from env, never hardcoded
// ---------------------------------------------------------------------------

const MPT_BASE_URL = process.env.MPT_BASE_URL;

/**
 * Throws if MPT is not configured — fails fast so the SaaS layer
 * never accidentally calls a placeholder URL in production.
 */
function getBaseUrl(): string {
  if (!MPT_BASE_URL) {
    throw new Error(
      '[MPT Service] MPT_BASE_URL is not set. ' +
      'MPT is a black-box external service. ' +
      'Set MPT_BASE_URL in your .env to the MPT engine URL (e.g. https://mpt.yourdomain.com/api/v1).'
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
  const url = `${getBaseUrl()}/videos`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
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
  const url = `${getBaseUrl()}/tasks/${taskId}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[MPT Service] getVideoTask failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.data ?? data;
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
