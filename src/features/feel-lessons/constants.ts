// src/features/feel-lessons/constants.ts
import type { LessonStep } from '@types';
import type { FeelStateOption } from './types';

/** Human-readable labels for each step type */
export const STEP_TYPE_LABELS: Record<LessonStep['type'], string> = {
  context: 'Context',
  shape: 'Shape',
  mnemonic: 'Mnemonic',
  sing: 'Sing',
  body: 'Body',
  hands: 'Hands',
  disappearing: 'Disappearing',
} as const;

/** Step types that are informational only (always allow forward navigation) */
export const INFORMATIONAL_STEPS: ReadonlySet<LessonStep['type']> = new Set([
  'context',
  'shape',
  'mnemonic',
]);

/** Step types that require explicit completion before advancing */
export const INTERACTIVE_STEPS: ReadonlySet<LessonStep['type']> = new Set([
  'sing',
  'body',
  'hands',
  'disappearing',
]);

/** Total number of steps in every lesson */
export const TOTAL_LESSON_STEPS = 7;

/** Feel state options shown on the completion screen */
export const FEEL_STATE_OPTIONS: readonly FeelStateOption[] = [
  {
    value: 'executing',
    label: 'Executing',
    description: "I can do it but I'm chasing the pattern",
  },
  {
    value: 'hearing',
    label: 'Hearing',
    description: 'I can hear the rhythm internally',
  },
  {
    value: 'feeling',
    label: 'Feeling',
    description: "It lives in my body \u2014 I don't have to think about it",
  },
] as const;
