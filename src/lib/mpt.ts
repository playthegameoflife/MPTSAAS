/**
 * @deprecated Use @/lib/mpt-service instead.
 * This file is kept for backwards compatibility during migration.
 * All new code should import from mpt-service.ts.
 */
export {
  submitVideoJob as createVideo,
  getVideoTask as getTask,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  BGM_TYPES,
} from './mpt-service';

export type { VideoParams, VideoTask } from './mpt-service';
