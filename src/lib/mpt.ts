// MoneyPrinterTurbo API client

const MPT_BASE_URL = process.env.MPT_BASE_URL || 'http://127.0.0.1:8080';

export interface VideoParams {
  video_subject: string;
  video_script?: string;
  video_aspect?: '9:16' | '16:9' | '1:1';
  voice_name?: string;
  bgm_type?: string;
  subtitle_enabled?: boolean;
  font_size?: number;
  text_fore_color?: string;
  stroke_color?: string;
  video_count?: number;
  video_language?: string;
}

export interface VideoTask {
  task_id: string;
  status: string;
  video_url?: string;
  created_at?: string;
  video_subject?: string;
  [key: string]: unknown;
}

export interface CreateVideoResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
  };
}

export interface GetTaskResponse {
  code: number;
  message: string;
  data: VideoTask;
}

// POST /videos — create a video generation task
export async function createVideo(params: VideoParams): Promise<CreateVideoResponse> {
  const res = await fetch(`${MPT_BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`MPT create failed: ${res.status}`);
  return res.json();
}

// GET /tasks/{task_id} — get task status + output URL
export async function getTask(taskId: string): Promise<GetTaskResponse> {
  const res = await fetch(`${MPT_BASE_URL}/tasks/${taskId}`);
  if (!res.ok) throw new Error(`MPT getTask failed: ${res.status}`);
  return res.json();
}
