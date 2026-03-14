// src/features/onboarding/constants.ts
import type {
  OnboardingStep,
  OnboardingData,
  RhythmOption,
  ExperienceOption,
  RoleOption,
} from './types';

export const RHYTHM_OPTIONS: RhythmOption[] = [
  {
    id: '3-2',
    name: '3:2',
    displayName: 'Three against Two',
    culturalOrigin: 'Afro-Cuban clave',
    available: true,
  },
  {
    id: '4-3',
    name: '4:3',
    displayName: 'Four against Three',
    culturalOrigin: 'Classical hemiola / Jazz',
    available: true,
  },
  {
    id: '2-3',
    name: '2:3',
    displayName: 'Two against Three',
    culturalOrigin: 'Reverse clave',
    available: false,
  },
];

export const EXPERIENCE_LEVELS: ExperienceOption[] = [
  {
    level: 'beginner',
    title: "What's a polyrhythm?",
    description: 'Start with the basics at a comfortable pace',
    defaultBpm: 60,
  },
  {
    level: 'intermediate',
    title: "I've heard of them",
    description: 'You know what they are but want to feel them',
    defaultBpm: 80,
  },
  {
    level: 'advanced',
    title: 'I can play some',
    description: 'Ready to refine your feel and expand',
    defaultBpm: 100,
  },
];

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'musician',
    title: 'Musician',
    description: 'I want to master rhythmic feel',
  },
  {
    role: 'parent',
    title: 'Parent',
    description: 'I want to do rhythm activities with my baby',
  },
  {
    role: 'both',
    title: 'Both',
    description: "I'm a musician and a parent",
  },
];

export const GENRES = [
  'Jazz',
  'Classical',
  'Afro-Cuban',
  'Hip-Hop',
  'Rock',
  'West African',
  'Latin',
  'Electronic',
  'Other',
] as const;

export const OTHER_GENRE_MAX_LENGTH = 30;

export const MUSICIAN_STEPS: OnboardingStep[] = [
  'rhythms',
  'experience',
  'role',
  'genres',
];

export const PARENT_STEPS: OnboardingStep[] = [
  'rhythms',
  'experience',
  'role',
  'genres',
  'baby-age',
];

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  selectedRhythms: [],
  rhythmLevel: null,
  role: null,
  genrePreferences: [],
  customGenre: '',
  babyName: '',
  babyBirthDate: null,
};
