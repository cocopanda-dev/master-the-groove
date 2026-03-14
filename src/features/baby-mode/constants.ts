// src/features/baby-mode/constants.ts
import type { BabyStageInfo } from './types';

/** Maximum volume for all baby mode audio (safety cap) */
export const BABY_MAX_VOLUME = 0.5;

/** Session time limit in seconds */
export const SESSION_LIMIT_S = 180;

/** Warning threshold in seconds before session ends */
export const SESSION_WARNING_S = 150;

/** One-time extension in seconds */
export const SESSION_EXTENSION_S = 60;

/** Minimum BPM for baby activities */
export const BABY_BPM_MIN = 60;

/** Maximum BPM for baby activities */
export const BABY_BPM_MAX = 100;

/** Default BPM for baby activities */
export const BABY_BPM_DEFAULT = 80;

/** Duet tap celebration window in ms */
export const CELEBRATION_WINDOW_MS = 200;

/** Parental gate hold duration in ms */
export const PARENTAL_GATE_HOLD_MS = 2000;

/** Baby visualizer BPM range */
export const VISUALIZER_BPM_MIN = 60;
export const VISUALIZER_BPM_MAX = 80;

/** Stage names keyed by stage number */
export const STAGE_NAMES: Record<number, string> = {
  0: 'Passive Listening',
  1: 'Parent Bounce',
  2: 'Pat-a-Cake',
  3: 'Tap Mode',
  4: 'Instrument Mode',
  5: 'Simple Game Mode',
};

/** Stage age range descriptions */
export const STAGE_AGE_RANGES: Record<number, string> = {
  0: '0-3 months',
  1: '3-6 months',
  2: '6-12 months',
  3: '12-18 months',
  4: '18-36 months',
  5: '3-5 years',
};

/** Stage info for MVP stages */
export const STAGE_INFO: readonly BabyStageInfo[] = [
  { stage: 1, name: 'Parent Bounce', ageRange: '3-6 months' },
  { stage: 2, name: 'Pat-a-Cake', ageRange: '6-12 months' },
  { stage: 3, name: 'Tap Mode', ageRange: '12-18 months' },
] as const;

/**
 * Cap a requested volume to the baby-safe maximum.
 * Returns the lower of the requested volume and BABY_MAX_VOLUME.
 */
export const capBabyVolume = (requested: number): number =>
  Math.min(Math.max(requested, 0), BABY_MAX_VOLUME);
