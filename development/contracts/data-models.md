> **WARNING: CANONICAL TYPE SOURCE** — This file is the single source of truth for all TypeScript types.
> All specs, tasks, and epic plans MUST reference these types. Do NOT redefine types in other documents.
> If a type needs to change, change it HERE first, then update dependent specs.

# GrooveCore — Data Models

**Last Updated:** 2026-03-13
**PRD Version:** 0.1
**Status:** Canonical — all agents must use these types

---

## Overview

This file defines every shared TypeScript interface, type, and enum used across GrooveCore. All feature code must import from a central `@/types` barrel file that mirrors these definitions.

**Rules:**
- Do not duplicate or redefine these types in feature code
- Do not add fields without updating this file first
- Stub types (P1+) are placeholders — implement the interface but leave the body as `throw new Error('Not implemented')`
- All `id` fields are `string` (UUID v4, generated client-side for offline support)
- All timestamps are ISO 8601 strings

---

## Core Types

### UserProfile

```typescript
interface UserProfile {
  /** UUID v4, generated on first launch */
  id: string;

  /** User-chosen display name, optional for MVP (anonymous auth) */
  displayName: string | null;

  /** Email address, null for anonymous users. Set when upgrading to email auth. */
  email: string | null;

  /** Primary role — determines tab visibility and content emphasis */
  role: 'musician' | 'parent' | 'both';

  /** Polyrhythm ratios selected during onboarding (e.g., ['3-2', '4-3']) */
  selectedRhythms: string[];

  /** Selected during onboarding, used by AI song recommender (P2) */
  genrePreferences: string[];

  /** ISO 8601 */
  createdAt: string;

  /** ISO 8601 */
  updatedAt: string;
}
```

### PolyrhythmRatio

```typescript
interface PolyrhythmRatio {
  /** Unique identifier, e.g. "3-2" */
  id: string;

  /** Numerator of the ratio (the "A" layer) */
  ratioA: number;

  /** Denominator of the ratio (the "B" layer) */
  ratioB: number;

  /** Compact display string, e.g. "3:2" */
  name: string;

  /** Human-readable name, e.g. "Three against Two" */
  displayName: string;

  /** Cultural/musical origin, e.g. "Afro-Cuban clave" */
  culturalOrigin: string;

  /** Memory aid phrase, e.g. "not diff-i-cult" for 3:2 */
  mnemonic: string;
}
```

### Session

```typescript
interface Session {
  /** UUID v4 */
  id: string;

  /** References UserProfile.id */
  userId: string;

  /** References PolyrhythmRatio.id */
  polyrhythmId: string;

  /** ISO 8601 — when the user pressed play */
  startedAt: string;

  /** ISO 8601 — when the session ended (null if in progress) */
  endedAt: string | null;

  /** Duration in seconds (computed from startedAt/endedAt) */
  duration: number;

  /** BPM at session start */
  bpmStart: number;

  /** BPM at session end (user may have adjusted during session) */
  bpmEnd: number;

  /** What mode was the user in during this session */
  mode: 'free-play' | 'lesson' | 'disappearing-beat' | 'duet-tap';

  /** Highest disappearing beat stage reached (0 = not attempted, stages 0-3 are used) */
  disappearingBeatStageReached: number;

  /** Drift from beat 1 in ms (negative = early, positive = late) */
  disappearingBeatDriftMs?: number;

  /** Qualitative drift zone classification */
  disappearingBeatDriftZone?: 'locked-in' | 'close' | 'drifting';

  /** Which layer was removed */
  disappearingBeatLayer?: 'A' | 'B';

  /** Number of bars per disappearing stage in this session */
  disappearingBeatBarsPerStage?: number;

  /** User self-reported feel state after session (null if skipped) */
  feelStateAfter: FeelState | null;
}
```

### FeelState

```typescript
/**
 * The three stages of rhythm internalization.
 * Users self-report after each session.
 *
 * - 'executing': "I can do it but I'm chasing the pattern"
 * - 'hearing': "I can hear the rhythm internally"
 * - 'feeling': "It lives in my body — I don't have to think about it"
 */
type FeelState = 'executing' | 'hearing' | 'feeling';
```

### BabyProfile

```typescript
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
```

### BabySession

```typescript
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
```

### LessonProgress

```typescript
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
```

### LessonStep

```typescript
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
```

### AudioConfig

```typescript
interface AudioConfig {
  /** Beats per cycle for layer A */
  ratioA: number;

  /** Beats per cycle for layer B */
  ratioB: number;

  /** Tempo in beats per minute */
  bpm: number;

  /** Sound for layer A */
  soundA: SoundId;

  /** Sound for layer B */
  soundB: SoundId;

  /** Which layer(s) to play: 'A' only, 'B' only, or 'both' (default: 'both') */
  layers?: 'A' | 'B' | 'both';

  /** Whether to split layers to left/right audio channels */
  stereoSplit: boolean;

  /** Volume for layer A (0.0 to 1.0) */
  volumeA: number;

  /** Volume for layer B (0.0 to 1.0) */
  volumeB: number;
}
```

### FadeState

```typescript
/**
 * Represents an in-progress volume fade on a single layer.
 * Used by the audio engine to animate volume changes during Disappearing Beat mode.
 */
interface FadeState {
  /** Which layer is fading */
  layer: 'A' | 'B';

  /** Volume level at fade start (0.0 to 1.0) */
  fromVolume: number;

  /** Target volume level (0.0 to 1.0) */
  toVolume: number;

  /** Timestamp (ms) when the fade started */
  startTime: number;

  /** Duration of the fade in milliseconds */
  duration: number;
}
```

### SoundId

```typescript
/**
 * Available sounds in the app's sound bank.
 *
 * Canonical name is SoundId. All specs and stores must use this name (not SoundName).
 *
 * MVP sounds: 'click', 'clave', 'woodblock'
 * Full set includes baby-friendly soft tones.
 *
 * Sound files live in assets/sounds/{sound-id}.wav
 */
type SoundId =
  | 'click'
  | 'clave'
  | 'woodblock'
  | 'djembe'
  | 'handpan'
  | 'soft-chime'
  | 'soft-bell';
```

### DisappearingBeatConfig

```typescript
interface DisappearingBeatConfig {
  /** Which layer disappears first: 'A' or 'B' */
  targetLayer: 'A' | 'B';

  /** Number of bars (complete cycles) per disappearing stage */
  barsPerStage: number;

  /**
   * Number of disappearing stages (default 3 for MVP):
   *   Stage 1: target fades to 50%
   *   Stage 2: target mutes completely
   *   Stage 3: both layers mute
   */
  stages: number;

  /** Number of full disappearing cycles before auto-stop (0 = infinite) */
  cycleCount: number;
}
```

### WeeklySummary

```typescript
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
```

---

## Stub Types (P1+)

These types define the interfaces for post-MVP features. They are included here so that MVP code can reference them at type level and leave proper extension points. **Do not implement these in MVP — only define the types.**

### AI Vocal Coach (P1)

```typescript
/** Request payload sent to Claude API for vocal coaching feedback */
interface AICoachRequest {
  /** The polyrhythm being practiced */
  polyrhythmId: string;

  /** Session tempo in BPM */
  bpm: number;

  /** User's current self-reported feel state */
  feelState: FeelState;

  /**
   * Array of onset timestamps (ms relative to session start).
   * Generated by on-device audio analysis — no raw audio sent.
   */
  onsetTimestamps: number[];

  /** Expected beat timestamps for comparison */
  expectedTimestamps: number[];

  /** Which layer the user was singing/tapping */
  targetLayer: 'A' | 'B';
}

/** Response from Claude API for vocal coaching */
interface AICoachResponse {
  /** 2-3 sentence coaching feedback */
  feedback: string;

  /** Specific area to focus on: 'timing' | 'consistency' | 'feel' | 'breathing' */
  focusArea: string;

  /** Optional: suggested BPM adjustment */
  suggestedBpm: number | null;

  /** Optional: suggested exercise to try next */
  suggestedExercise: string | null;
}
```

### Vocal Onset Detection (P1)

```typescript
/** Raw onset data from on-device audio analysis */
interface VocalOnsetData {
  /** Onset timestamps in milliseconds, relative to recording start */
  onsets: number[];

  /** Confidence score for each onset (0.0 to 1.0) */
  confidences: number[];

  /** Duration of the recording in milliseconds */
  recordingDuration: number;

  /** Sample rate used for analysis */
  sampleRate: number;
}
```

### Body Layer Mode (P1)

```typescript
/**
 * Assigns a rhythm layer to a body part for independence training.
 * Used in Body Layer Mode (P1).
 */
interface BodyLayerAssignment {
  /** Which rhythm layer this assignment controls */
  layer: 'A' | 'B';

  /** Body part assigned to this layer */
  bodyPart: 'voice' | 'clapping' | 'right-hand' | 'left-hand' | 'foot-stomp';

  /** Input method for detecting this body part's rhythm */
  inputMethod: 'tap' | 'microphone' | 'accelerometer';
}
```

### AI Mnemonic Generator (P2)

```typescript
/** Request to generate custom mnemonics */
interface MnemonicRequest {
  /** The polyrhythm to generate mnemonics for */
  polyrhythmId: string;

  /** User's chosen theme category */
  themeCategory: 'animals' | 'food' | 'sports' | 'names' | 'custom';

  /** Custom theme string if themeCategory is 'custom' */
  customTheme: string | null;

  /** The exact syllable pattern to match, e.g. [3, 2] for 3:2 */
  syllablePattern: number[];
}

/** Response with generated mnemonic options */
interface MnemonicResponse {
  /** 2-3 mnemonic options that fit the syllable count */
  mnemonics: Array<{
    /** The mnemonic phrase */
    phrase: string;

    /** Syllable breakdown showing alignment to beats */
    syllableBreakdown: string;

    /** Which theme it matches */
    theme: string;
  }>;
}
```

---

## Enums & Constants

### Activity Types (Baby Mode)

```typescript
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
```

### Supported Ratios (MVP)

```typescript
/**
 * Polyrhythm ratios available at MVP.
 * Additional ratios added in later phases.
 */
const MVP_RATIOS: PolyrhythmRatio[] = [
  {
    id: '3-2',
    ratioA: 3,
    ratioB: 2,
    name: '3:2',
    displayName: 'Three against Two',
    culturalOrigin: 'Afro-Cuban clave',
    mnemonic: 'not diff-i-cult',
  },
  {
    id: '4-3',
    ratioA: 4,
    ratioB: 3,
    name: '4:3',
    displayName: 'Four against Three',
    culturalOrigin: 'Classical hemiola / Jazz',
    mnemonic: 'pass the bread and but-ter',
  },
  {
    id: '2-3',
    ratioA: 2,
    ratioB: 3,
    name: '2:3',
    displayName: 'Two against Three (reverse clave)',
    culturalOrigin: 'Afro-Cuban reverse clave',
    mnemonic: 'cold cup of tea',
  },
];
```

---

## Type Export Barrel

All types should be re-exported from a single barrel file at `@/types/index.ts`:

```typescript
// @/types/index.ts
export type {
  UserProfile,
  PolyrhythmRatio,
  Session,
  FeelState,
  BabyProfile,
  BabySession,
  LessonProgress,
  LessonStep,
  AudioConfig,
  FadeState,
  SoundId,
  DisappearingBeatConfig,
  WeeklySummary,
  // Stubs (P1+)
  AICoachRequest,
  AICoachResponse,
  VocalOnsetData,
  BodyLayerAssignment,
  MnemonicRequest,
  MnemonicResponse,
  BabyActivityType,
};
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-03-13 | Initial creation — all MVP types + P1/P2 stubs | — |
| 2026-03-13 | Added email, selectedRhythms to UserProfile; added mode to Session | Spec review fix |
