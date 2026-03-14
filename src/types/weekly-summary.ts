import type { FeelState } from './feel-state';

/**
 * Computed on-the-fly from session data. Not persisted to AsyncStorage or Supabase.
 * Cached in progressStore with TTL-based invalidation.
 */
interface WeeklySummary {
  /** References UserProfile.id */
  userId: string;

  /** ISO 8601 date of the Monday starting this week */
  weekStart: string;

  /** Total minutes spent in practice sessions */
  totalPracticeMinutes: number;

  /** Number of completed sessions */
  sessionsCount: number;

  /** List of PolyrhythmRatio.id values practiced this week */
  polyrhythmsVisited: string[];

  /**
   * Record of feel state transitions this week.
   * Key: PolyrhythmRatio.id
   * Value: { from: FeelState, to: FeelState }
   */
  feelStateChanges: Record<string, { from: FeelState; to: FeelState }>;
}

export type { WeeklySummary };
