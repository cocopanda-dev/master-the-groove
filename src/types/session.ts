import type { FeelState } from './feel-state';

type SessionMode = 'free-play' | 'lesson' | 'disappearing-beat' | 'duet-tap';

interface Session {
  /** UUID v4 */
  id: string;

  /** References UserProfile.id */
  userId: string;

  /** References PolyrhythmRatio.id */
  polyrhythmId: string;

  /** ISO 8601 — when the user pressed play */
  startedAt: string;

  /** ISO 8601 — when the session ended (null if in progress) */
  endedAt: string | null;

  /** Duration in seconds (computed from startedAt/endedAt) */
  duration: number;

  /** BPM at session start */
  bpmStart: number;

  /** BPM at session end (user may have adjusted during session) */
  bpmEnd: number;

  /** What mode was the user in during this session */
  mode: SessionMode;

  /** Highest disappearing beat stage reached (0 = not attempted, stages 0-3 are used) */
  disappearingBeatStageReached: number;

  /** Drift from beat 1 in ms (negative = early, positive = late) */
  disappearingBeatDriftMs?: number;

  /** Qualitative drift zone classification */
  disappearingBeatDriftZone?: 'locked-in' | 'close' | 'drifting';

  /** Which layer was removed */
  disappearingBeatLayer?: 'A' | 'B';

  /** Number of bars per disappearing stage in this session */
  disappearingBeatBarsPerStage?: number;

  /** User self-reported feel state after session (null if skipped) */
  feelStateAfter: FeelState | null;
}

export type { Session, SessionMode };
