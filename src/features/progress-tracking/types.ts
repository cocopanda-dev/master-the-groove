import type { FeelState } from '@types';

/**
 * Represents a feel state transition for a polyrhythm within a time period.
 * Used in WeeklyOverviewCard to show progression or regression.
 */
type FeelStateChange = {
  polyrhythmId: string;
  from: FeelState;
  to: FeelState;
};

/**
 * Derived data for a single polyrhythm displayed in the dashboard.
 */
type PolyrhythmProgress = {
  polyrhythmId: string;
  name: string;
  currentFeelState: FeelState | null;
  lastPracticedAt: string | null;
  sessionCount: number;
};

/**
 * All data needed by the Progress tab, derived from sessionStore.
 */
type ProgressData = {
  weeklySummary: {
    totalMinutes: number;
    sessionCount: number;
    polyrhythmsVisited: string[];
    streak: number;
    feelStateChanges: FeelStateChange[];
  };
  polyrhythms: PolyrhythmProgress[];
  hasAnySessions: boolean;
};

export type { FeelStateChange, PolyrhythmProgress, ProgressData };
