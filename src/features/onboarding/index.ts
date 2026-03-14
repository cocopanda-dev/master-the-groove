// src/features/onboarding/index.ts

// Types
export type {
  OnboardingData,
  OnboardingStep,
  RhythmLevel,
  UserRole,
  RhythmOption,
  ExperienceOption,
  RoleOption,
} from './types';

// Constants
export {
  RHYTHM_OPTIONS,
  EXPERIENCE_LEVELS,
  ROLE_OPTIONS,
  GENRES,
  OTHER_GENRE_MAX_LENGTH,
  MUSICIAN_STEPS,
  PARENT_STEPS,
  INITIAL_ONBOARDING_DATA,
} from './constants';

// Hooks & Context
export { useOnboardingFlow } from './hooks/use-onboarding-flow';
export { OnboardingProvider, useOnboardingContext } from './hooks/OnboardingContext';

// Components
export { ProgressDots } from './components/ProgressDots';
export { RhythmCard } from './components/RhythmCard';
export { ExperienceLevelCard } from './components/ExperienceLevelCard';
export { RoleCard } from './components/RoleCard';
export { GenreChip } from './components/GenreChip';
