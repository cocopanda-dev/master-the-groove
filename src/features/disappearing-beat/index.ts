// src/features/disappearing-beat/index.ts

// Components
export { DisappearingBeatConfigScreen } from './components/DisappearingBeatConfigScreen';
export { DisappearingBeatPlayback } from './components/DisappearingBeatPlayback';
export { DisappearingBeatResults } from './components/DisappearingBeatResults';
export { DisappearingBeatInline } from './components/DisappearingBeatInline';
export { StageIndicator } from './components/StageIndicator';
export { VolumeIndicator } from './components/VolumeIndicator';
export { TapTarget } from './components/TapTarget';
export { DriftFeedback } from './components/DriftFeedback';

// Hooks
export { useDisappearingBeatEngine } from './hooks/use-disappearing-beat-engine';
export { useDriftTracker } from './hooks/use-drift-tracker';

// Types
export type {
  DisappearingBeatStage,
  StageConfig,
  DisappearingBeatResult,
} from './types';

// Constants
export {
  DEFAULT_CONFIG,
  STAGE_LABELS,
  DRIFT_LOCKED_IN_MS,
  DRIFT_CLOSE_MS,
  TAP_TARGET_SIZE,
  POLYRHYTHM_OPTIONS,
  BARS_PER_STAGE_OPTIONS,
  RETURN_CYCLES_OPTIONS,
} from './constants';
