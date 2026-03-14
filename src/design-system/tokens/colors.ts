export const colors = {
  primary: '#3730A3',
  primaryLight: '#6366F1',
  primaryDark: '#1E1B4B',
  secondary: '#F97316',
  secondaryLight: '#FB923C',
  accent: '#EAB308',
  background: '#0F0D1A',
  surface: '#1C1830',
  surfaceLight: '#2A2545',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  border: '#334155',

  // Layer colors (visualizer)
  layerA: '#818CF8',
  layerB: '#FB923C',
  beatOne: '#EAB308',
  layerAFaded: '#818CF840',
  layerBFaded: '#FB923C40',

  // Drift feedback
  driftLockedIn: '#22C55E',
  driftClose: '#FBBF24',
  driftDrifting: '#F97316',

  // Baby mode
  babyBackground: '#FFF7ED',
  babySurface: '#FFFFFF',
  babyPrimary: '#F97316',
  babySecondary: '#8B5CF6',
  babyAccent: '#EC4899',
  babyTextPrimary: '#1C1917',
  babyTextSecondary: '#78716C',
  babyTapZoneA: '#3B82F6',
  babyTapZoneB: '#F97316',
  babyCelebration: '#EAB308',

  // Baby visualizer
  babyVisualizerColors: ['#F97316', '#FBBF24', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'] as const,
} as const;

export type ColorToken = keyof typeof colors;
