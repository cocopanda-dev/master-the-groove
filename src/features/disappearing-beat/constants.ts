// src/features/disappearing-beat/constants.ts
import type { StageConfig, DisappearingBeatStage } from './types';

/** Minimum warm-up duration in milliseconds */
export const MIN_WARMUP_MS = 8000;

/** Drift zone thresholds in milliseconds */
export const DRIFT_LOCKED_IN_MS = 50;
export const DRIFT_CLOSE_MS = 120;

/** Minimum tap target size in points */
export const TAP_TARGET_SIZE = 80;

/** Number of bars used for fading during stage transitions */
export const FADE_DURATION_CYCLES = 2;

/** Default configuration */
export const DEFAULT_CONFIG: StageConfig = {
  ratioA: 3,
  ratioB: 2,
  bpm: 90,
  targetLayer: 'A',
  barsPerStage: 8,
  returnCycles: 2,
};

/** Polyrhythm options available in config screen */
export const POLYRHYTHM_OPTIONS = [
  { label: '3:2', ratioA: 3, ratioB: 2 },
  { label: '4:3', ratioA: 4, ratioB: 3 },
] as const;

/** Bars per stage options */
export const BARS_PER_STAGE_OPTIONS = [4, 8, 16] as const;

/** Return cycles options */
export const RETURN_CYCLES_OPTIONS = [1, 2, 3] as const;

/** Stage display labels */
export const STAGE_LABELS: Record<DisappearingBeatStage, string> = {
  idle: '',
  warmup: 'Warm-up',
  stage1: 'Stage 1 of 3',
  stage2: 'Stage 2 of 3',
  stage3: 'Stage 3 of 3',
  return: 'Return',
  completed: 'Complete',
};

/** Stage numeric value for session recording */
export const STAGE_NUMBER: Record<DisappearingBeatStage, number> = {
  idle: 0,
  warmup: 0,
  stage1: 1,
  stage2: 2,
  stage3: 3,
  return: 3,
  completed: 3,
};
