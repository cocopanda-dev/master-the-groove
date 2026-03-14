// src/features/baby-mode/types.ts
import type { BabyActivityType } from '@types';

export interface BabyActivityCard {
  /** Unique card ID, e.g. "s1-bounce-basic" */
  readonly id: string;

  /** Stage this card belongs to (1-3 for MVP) */
  readonly stageId: 1 | 2 | 3;

  /** Display title */
  readonly title: string;

  /** Parent-facing instruction text */
  readonly instruction: string;

  /** Suggested duration in seconds */
  readonly durationSeconds: number;

  /** Activity type for session logging */
  readonly activityType: BabyActivityType;

  /** Optional audio configuration for the activity */
  readonly audioConfig?: {
    readonly bpm: number;
    readonly soundId: string;
  };
}

export interface BabyStageInfo {
  /** Stage number (1-3 for MVP) */
  readonly stage: number;

  /** Human-readable stage name */
  readonly name: string;

  /** Age range description */
  readonly ageRange: string;
}
