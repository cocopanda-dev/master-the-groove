// src/features/baby-mode/constants.ts

/** Maximum volume multiplier for all baby mode audio (50% of system volume) */
export const BABY_MAX_VOLUME = 0.5;

/** Maximum session duration in seconds (3 minutes) */
export const SESSION_LIMIT_S = 180;

/** Warning threshold in seconds ("Almost done!" indicator) */
export const WARNING_S = 150;

/** One-time extension duration in seconds */
export const EXTENSION_S = 60;

/** Human-readable stage names for MVP stages 0-5 */
export const STAGE_NAMES: Record<number, string> = {
  0: 'Too Young',
  1: 'Parent Bounce Mode',
  2: 'Pat-a-Cake Mode',
  3: 'Tap Mode',
  4: 'Instrument Mode',
  5: 'Simple Game Mode',
} as const;

/** Stage age range descriptions */
export const STAGE_AGE_RANGES: Record<number, string> = {
  0: '0-3 months',
  1: '3-6 months',
  2: '6-12 months',
  3: '12-18 months',
  4: '18-36 months',
  5: '3-5 years',
} as const;

/**
 * Cap a volume value to the baby-safe maximum.
 * All baby audio playback must route through this utility.
 */
export const capBabyVolume = (requested: number): number =>
  Math.min(requested, BABY_MAX_VOLUME);
