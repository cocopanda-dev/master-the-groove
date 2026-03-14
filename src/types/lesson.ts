import type { AudioConfig } from './audio';

interface LessonProgress {
  /** UUID v4 */
  id: string;

  /** References UserProfile.id */
  userId: string;

  /** References PolyrhythmRatio.id */
  polyrhythmId: string;

  /**
   * Current step in the 7-step lesson (1-7).
   * See LessonStep for step definitions.
   */
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  /** True when all 7 steps have been completed */
  completed: boolean;

  /** True when the feel badge has been awarded for this lesson */
  feelBadgeEarned: boolean;

  /** ISO 8601 — last time the user worked on this lesson */
  lastAttemptAt: string;
}

interface LessonStep {
  /** Step number (1-7) */
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  /**
   * Step type determines rendering and interaction model:
   * - 'context': real music example (text + link)
   * - 'shape': visual/textual explanation of the rhythm's feel
   * - 'mnemonic': syllable trick display
   * - 'sing': vocal exercise prompt (mic input in P1)
   * - 'body': physical exercise prompt (walk + clap)
   * - 'hands': tap interface using core player
   * - 'disappearing': launches disappearing beat mode
   */
  type: 'context' | 'shape' | 'mnemonic' | 'sing' | 'body' | 'hands' | 'disappearing';

  /** Short title displayed at top of step screen */
  title: string;

  /** Primary instruction text shown to the user */
  instruction: string;

  /** Secondary/subtitle text shown below the primary instruction */
  secondaryText?: string;

  /**
   * Interaction model for this step's UI.
   * - 'tap-zones': interactive tap zones (hands/body steps)
   * - 'timer': timed exercise with countdown
   * - 'self-report': user reports their feel state
   * - 'disappearing-beat': launches disappearing beat mode
   */
  interactionType?: 'tap-zones' | 'timer' | 'self-report' | 'disappearing-beat';

  /** Additional configuration for the interaction (varies by interactionType) */
  interactionConfig?: Record<string, unknown>;

  /** Audio configuration for this step (null if step has no audio) */
  audioConfig: AudioConfig | null;
}

export type { LessonProgress, LessonStep };
