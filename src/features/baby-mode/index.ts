// src/features/baby-mode/index.ts
export { BabyHomeScreen } from './components/BabyHomeScreen';
export { DuetTapScreen } from './components/DuetTapScreen';
export { BabyVisualizerScreen } from './components/BabyVisualizerScreen';
export { ParentalGate } from './components/ParentalGate';
export type { ParentalGateProps } from './components/ParentalGate';
export { TimeLimitScreen } from './components/TimeLimitScreen';
export type { TimeLimitScreenProps } from './components/TimeLimitScreen';
export { StageBanner } from './components/StageBanner';
export { ActivityCard } from './components/ActivityCard';
export type { BabyActivityCard, ActivityCardProps } from './components/ActivityCard';
export { QuickLaunchButtons } from './components/QuickLaunchButtons';
export { BabyResponsePrompt } from './components/BabyResponsePrompt';
export type { BabyResponsePromptProps, BabyResponse } from './components/BabyResponsePrompt';

export { useBabySessionTimer } from './hooks/use-baby-session-timer';
export type { UseBabySessionTimerOptions, UseBabySessionTimerResult } from './hooks/use-baby-session-timer';
export { useBabyStage } from './hooks/use-baby-stage';
export type { BabyStageInfo } from './hooks/use-baby-stage';

export {
  BABY_MAX_VOLUME,
  SESSION_LIMIT_S,
  WARNING_S,
  EXTENSION_S,
  STAGE_NAMES,
  STAGE_AGE_RANGES,
  capBabyVolume,
} from './constants';
