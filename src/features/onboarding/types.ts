// src/features/onboarding/types.ts

export type OnboardingStep = 'rhythms' | 'experience' | 'role' | 'genres' | 'baby-age';

export type RhythmLevel = 'beginner' | 'intermediate' | 'advanced';

export type UserRole = 'musician' | 'parent' | 'both';

export interface OnboardingData {
  /** Selected polyrhythm ratio IDs (e.g., ['3-2', '4-3']) */
  selectedRhythms: string[];

  /** Self-assessed rhythm experience level */
  rhythmLevel: RhythmLevel | null;

  /** User role selection */
  role: UserRole | null;

  /** Selected genre preferences */
  genrePreferences: string[];

  /** Custom genre text if "Other" is selected */
  customGenre: string;

  /** Baby name (defaults to "Baby" if left empty) */
  babyName: string;

  /** Baby birth date as ISO 8601 date string, or null if not set */
  babyBirthDate: string | null;
}

export interface RhythmOption {
  id: string;
  name: string;
  displayName: string;
  culturalOrigin: string;
  available: boolean;
}

export interface ExperienceOption {
  level: RhythmLevel;
  title: string;
  description: string;
  defaultBpm: number;
}

export interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
}
