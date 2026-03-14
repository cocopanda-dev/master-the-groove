/**
 * Canonical activity type strings for BabySession.activityType.
 * Using string literals instead of enum for JSON serialization simplicity.
 */
const BABY_ACTIVITY_TYPES = [
  'passive-listening',
  'bounce',
  'pat-a-cake',
  'duet-tap',
  'visualizer',
  'activity-card',
  'instrument',       // P3
  'stomp-clap-game',  // P3
] as const;

type BabyActivityType = typeof BABY_ACTIVITY_TYPES[number];

interface BabyProfile {
  /** UUID v4 */
  id: string;

  /** References UserProfile.id (the parent) */
  userId: string;

  /** Baby's name, used in UI and session summaries */
  babyName: string;

  /** ISO 8601 date string (date only, no time) */
  birthDate: string;

  /**
   * Current developmental stage (0-5).
   * Auto-computed from birthDate:
   *   0 = 0-3 months (passive listening)
   *   1 = 3-6 months (parent bounce)
   *   2 = 6-12 months (pat-a-cake)
   *   3 = 12-18 months (tap mode)
   *   4 = 18-36 months (instrument mode) — P3
   *   5 = 3-5 years (simple game mode) — P3
   * MVP supports stages 1-3 only.
   */
  currentStage: 0 | 1 | 2 | 3 | 4 | 5;

  /**
   * The manually overridden stage number, or null if using auto-computed stage.
   * When set, overrides the age-based `currentStage` calculation.
   */
  stageOverride: number | null;
}

interface BabySession {
  /** UUID v4 */
  id: string;

  /** References BabyProfile.id */
  babyProfileId: string;

  /**
   * What type of activity was performed.
   * Must be one of the values in BABY_ACTIVITY_TYPES constant.
   * See BabyActivityType union type below.
   */
  activityType: BabyActivityType;

  /** Duration in seconds */
  duration: number;

  /** Parent-reported baby response. null when parent dismisses prompt without selecting. */
  babyResponse: 'calm' | 'excited' | 'disengaged' | null;

  /** ISO 8601 */
  completedAt: string;
}

export type { BabyProfile, BabySession, BabyActivityType };
export { BABY_ACTIVITY_TYPES };
