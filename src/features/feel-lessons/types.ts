// src/features/feel-lessons/types.ts
import type { LessonStep } from '@types';

/** Shape of lesson data loaded from JSON files */
export interface LessonData {
  readonly polyrhythmId: string;
  readonly title: string;
  readonly steps: readonly LessonStep[];
}

/** State managed by the lesson engine hook */
export interface LessonEngineState {
  /** Zero-based index of the current step */
  readonly currentStepIndex: number;
  /** Set of step indices (zero-based) that have been completed */
  readonly completedSteps: ReadonlySet<number>;
  /** Whether the entire lesson is complete */
  readonly isLessonComplete: boolean;
  /** The current step data */
  readonly currentStep: LessonStep | undefined;
  /** Total number of steps */
  readonly totalSteps: number;
}

/** Actions exposed by the lesson engine hook */
export interface LessonEngineActions {
  /** Navigate to the next step (blocked if current step is interactive and not completed) */
  goNext: () => void;
  /** Navigate to the previous step */
  goBack: () => void;
  /** Mark the current step as done (for interactive steps) */
  markStepDone: () => void;
  /** Whether the Next button should be enabled */
  canGoNext: boolean;
  /** Whether the Back button should be enabled */
  canGoBack: boolean;
}

/** Feel state option shown on the completion screen */
export interface FeelStateOption {
  readonly value: 'executing' | 'hearing' | 'feeling';
  readonly label: string;
  readonly description: string;
}
