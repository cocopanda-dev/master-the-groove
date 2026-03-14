// src/features/baby-mode/index.ts

// Types
export type { BabyActivityCard, BabyStageInfo } from './types';

// Constants
export {
  BABY_MAX_VOLUME,
  SESSION_LIMIT_S,
  SESSION_WARNING_S,
  SESSION_EXTENSION_S,
  BABY_BPM_DEFAULT,
  BABY_BPM_MIN,
  BABY_BPM_MAX,
  CELEBRATION_WINDOW_MS,
  PARENTAL_GATE_HOLD_MS,
  VISUALIZER_BPM_MIN,
  VISUALIZER_BPM_MAX,
  STAGE_NAMES,
  STAGE_AGE_RANGES,
  STAGE_INFO,
  capBabyVolume,
} from './constants';

// Hooks
export { useBabyStage } from './hooks/use-baby-stage';
export type { UseBabyStageResult } from './hooks/use-baby-stage';
export { useBabySessionTimer } from './hooks/use-baby-session-timer';
export type { UseBabySessionTimerResult, TimerStatus } from './hooks/use-baby-session-timer';

// Components
export { ParentalGate } from './components/ParentalGate';
export { VolumeWarningModal } from './components/VolumeWarningModal';
export { StageBanner } from './components/StageBanner';
export { ActivityCard } from './components/ActivityCard';
export { ActivityCardCarousel } from './components/ActivityCardCarousel';
export { ActivityDetailView } from './components/ActivityDetailView';
export { BabyResponsePrompt } from './components/BabyResponsePrompt';
export { DuetTapScreenComponent } from './components/DuetTapScreen';
export { BabyVisualizerScreenComponent } from './components/BabyVisualizerScreen';
export { SessionHistoryList } from './components/SessionHistoryList';
export { QuickLaunchButtons } from './components/QuickLaunchButtons';
