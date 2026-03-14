// src/features/disappearing-beat/types.ts
import type { DriftResult } from '@operations/drift-detection';

/**
 * Stages of the disappearing beat mode.
 * warmup -> stage1 -> stage2 -> stage3 -> return -> completed
 */
export type DisappearingBeatStage =
  | 'idle'
  | 'warmup'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'return'
  | 'completed';

/**
 * Configuration for a disappearing beat session.
 */
export type StageConfig = {
  /** Polyrhythm ratio A */
  ratioA: number;
  /** Polyrhythm ratio B */
  ratioB: number;
  /** Tempo in BPM */
  bpm: number;
  /** Which layer disappears */
  targetLayer: 'A' | 'B';
  /** Number of bars (cycles) per stage */
  barsPerStage: number;
  /** Number of return cycles after stage 3 */
  returnCycles: number;
};

/**
 * Result of a completed disappearing beat session.
 */
export type DisappearingBeatResult = {
  /** The configuration that was used */
  config: StageConfig;
  /** Highest stage reached (0-3) */
  highestStage: number;
  /** Drift measurement result from stage 3, null if stage 3 not reached */
  driftResult: DriftResult | null;
  /** Duration in seconds */
  durationSeconds: number;
  /** Whether the session was completed (all stages + return) */
  completed: boolean;
};
