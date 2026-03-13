# Data Layer — Foundation Spec

**Foundation:** Data Layer
**Status:** Not Started
**Dependencies:** None (leaf foundation, though Supabase client depends on environment config)
**Consumers:** All features (Learn, Practice, Baby Mode, Progress, Settings, AI features)

---

## Overview

The data layer owns all application state, local persistence, and remote synchronization. It follows an **offline-first** architecture: all reads come from local Zustand stores, all writes go to local stores first and then sync to Supabase in the background. Features never query Supabase directly.

---

## 1. Zustand Store Architecture

### Guiding Principles

1. **One store file per domain.** No monolithic store. Each domain has its own file with its own state shape, actions, and selectors.
2. **Stores are independent.** Stores do not import from each other. Cross-store coordination happens at the feature layer or via event callbacks.
3. **Persist middleware.** All stores (except `audioStore`, which is ephemeral) use Zustand's `persist` middleware with `AsyncStorage` as the storage backend.
4. **TypeScript-first.** Every state shape, action, and selector is fully typed. No `any`.

### Store Files

```
src/stores/
├── use-user-store.ts       # User profile, onboarding, auth state
├── use-session-store.ts    # Practice sessions (current + history)
├── use-lesson-store.ts     # Lesson progress per polyrhythm
├── use-baby-store.ts       # Baby profile, baby sessions
├── use-settings-store.ts   # App preferences
└── use-audio-store.ts      # (Defined in audio engine foundation — not persisted)
```

**Note:** Store file names follow the `use-<domain>-store.ts` convention from `contracts/coding-conventions.md`. The exported hook names use camelCase: `useUserStore`, `useSessionStore`, etc.

---

## 2. userStore

### State Shape

**See `contracts/data-models.md` for the canonical `UserProfile` type.** Key fields: `id`, `displayName`, `email`, `role`, `selectedRhythms`, `genrePreferences`, `createdAt`, `updatedAt`.

```typescript
// UserProfile — canonical definition in contracts/data-models.md
// Imported from @/types in implementation

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  isAnonymous: boolean;
}
```

### Actions

```typescript
interface UserActions {
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  updateRole: (role: UserProfile['role']) => void;
  updateGenrePreferences: (genres: string[]) => void;
  upgradeFromAnonymous: (email: string, name: string) => void;
  clearProfile: () => void;   // for sign-out
}
```

### Selectors

```typescript
const selectProfile = (state: UserState) => state.profile;
const selectRole = (state: UserState) => state.profile?.role ?? null;
const selectIsOnboarded = (state: UserState) => state.isOnboarded;
const selectIsAnonymous = (state: UserState) => state.isAnonymous;
const selectGenres = (state: UserState) => state.profile?.genrePreferences ?? [];
```

### Persistence

- Persisted to AsyncStorage under key `user-store`.
- On app launch, Zustand `persist` middleware rehydrates from AsyncStorage.
- `isOnboarded` flag is the gate for showing onboarding flow (consumed by navigation shell).

---

## 3. sessionStore

### State Shape

**See `contracts/data-models.md` for the canonical `Session` type.** Key fields: `id`, `userId`, `polyrhythmId`, `startedAt`, `endedAt`, `duration` (seconds), `bpmStart`, `bpmEnd`, `mode`, `disappearingBeatStageReached`, `feelStateAfter`.

```typescript
// Session — canonical definition in contracts/data-models.md
// Imported from @/types in implementation

interface SessionState {
  currentSession: Session | null;
  sessionHistory: Session[];           // most recent first, capped at 500 locally
}
```

### Actions

```typescript
interface SessionActions {
  startSession: (params: {
    polyrhythmId: string;
    mode: Session['mode'];
    bpm: number;
  }) => void;
  updateSession: (updates: Partial<Pick<Session, 'bpmEnd' | 'disappearingBeatStageReached'>>) => void;
  endSession: (feelStateAfter: FeelState | null) => void;
  getSessionHistory: (limit?: number) => Session[];
  getSessionsForPolyrhythm: (polyrhythmId: string) => Session[];
}
```

### Selectors

```typescript
const selectCurrentSession = (state: SessionState) => state.currentSession;
const selectSessionHistory = (state: SessionState) => state.sessionHistory;
const selectTotalPracticeSeconds = (state: SessionState) =>
  state.sessionHistory.reduce((sum, s) => sum + s.duration, 0);
const selectSessionCountThisWeek = (state: SessionState) => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return state.sessionHistory.filter(s => new Date(s.startedAt).getTime() > weekAgo).length;
};
```

### Persistence

- Persisted to AsyncStorage under key `session-store`.
- `sessionHistory` is capped at 500 entries locally. Older entries are purged after successful Supabase sync.

---

## 4. lessonStore

### State Shape

**See `contracts/data-models.md` for the canonical `LessonProgress` type.** Key fields: `id`, `userId`, `polyrhythmId`, `currentStep` (1-7, **1-indexed**), `completed`, `feelBadgeEarned`, `lastAttemptAt`.

```typescript
// LessonProgress — canonical definition in contracts/data-models.md
// currentStep is 1-indexed (1-7) to match the DB constraint CHECK (current_step BETWEEN 1 AND 7)

interface LessonState {
  progressByPolyrhythm: Record<string, LessonProgress>;  // keyed by polyrhythmId
}
```

### Actions

```typescript
interface LessonActions {
  startLesson: (polyrhythmId: string, totalSteps: number) => void;
  advanceStep: (polyrhythmId: string) => void;
  completeLesson: (polyrhythmId: string) => void;
  awardFeelBadge: (polyrhythmId: string) => void;
  updateBestDisappearingBeatStage: (polyrhythmId: string, stage: number) => void;
  resetLesson: (polyrhythmId: string) => void;
  markLessonSynced: (polyrhythmId: string) => void;
}
```

### Selectors

```typescript
const selectLessonProgress = (polyrhythmId: string) =>
  (state: LessonState) => state.progressByPolyrhythm[polyrhythmId] ?? null;
const selectCompletedLessons = (state: LessonState) =>
  Object.values(state.progressByPolyrhythm).filter(p => p.isCompleted);
const selectFeelBadges = (state: LessonState) =>
  Object.values(state.progressByPolyrhythm).filter(p => p.feelBadgeAwarded).map(p => p.polyrhythmId);
const selectAllLessonProgress = (state: LessonState) => state.progressByPolyrhythm;
```

### Persistence

- Persisted to AsyncStorage under key `lesson-store`.
- Lesson progress is critical user data — never purged locally.

---

## 5. babyStore

### State Shape

**See `contracts/data-models.md` for canonical `BabyProfile` and `BabySession` types.**

- `BabyProfile`: `id`, `userId`, `babyName`, `birthDate`, `currentStage` (0-5), `stageOverride`
- `BabySession`: `id`, `babyProfileId`, `activityType` (string, see `BabyActivityType`), `duration` (seconds), `babyResponse`, `completedAt`

```typescript
interface BabyState {
  babyProfile: BabyProfile | null;
  babySessions: BabySession[];         // most recent first
}
```

### Actions

```typescript
interface BabyActions {
  setBabyProfile: (profile: BabyProfile) => void;
  updateBabyName: (name: string) => void;
  updateBabyBirthDate: (birthDate: string) => void;
  updateStage: (stage: BabyProfile['currentStage']) => void;
  setStageOverride: (override: boolean) => void;
  logBabySession: (session: Omit<BabySession, 'id'>) => void;
  clearBabyProfile: () => void;
}
```

### Selectors

```typescript
const selectBabyProfile = (state: BabyState) => state.babyProfile;
const selectBabyAge = (state: BabyState) => {
  if (!state.babyProfile) return null;
  // returns age in months
};
const selectBabySessions = (state: BabyState) => state.babySessions;
const selectBabySessionCountThisWeek = (state: BabyState) => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return state.babySessions.filter(s => new Date(s.completedAt).getTime() > weekAgo).length;
};
const selectTotalBabyBondingSeconds = (state: BabyState) =>
  state.babySessions.reduce((sum, s) => sum + s.duration, 0);
const selectCurrentStage = (state: BabyState) => state.babyProfile?.currentStage ?? 0;
```

### Auto-Stage Calculation

When `manualStageOverride` is false, the baby's current stage is auto-calculated from their birth date:

| Age (months) | Stage |
|--------------|-------|
| 0-3 | 0 (Passive listening) |
| 3-6 | 1 (Parent bounce) |
| 6-12 | 2 (Pat-a-cake) |
| 12-18 | 3 (Tap mode) |
| 18-36 | 4 (Instrument mode) |
| 36-60 | 5 (Simple game mode) |

A utility function `calculateStageFromBirthDate(birthDate: string): number` is exported for use by the store and features.

### Persistence

- Persisted to AsyncStorage under key `baby-store`.

---

## 6. settingsStore

### State Shape

```typescript
interface SettingsState {
  // Audio defaults
  masterVolume: number;                // 0.0-1.0, default 1.0
  defaultBpm: number;                  // default 90
  preferredSoundA: SoundName;          // default 'click'
  preferredSoundB: SoundName;          // default 'clave'

  // UX preferences
  hapticEnabled: boolean;              // default true
  keepScreenAwake: boolean;            // default true (during playback)
  showBeatNumbers: boolean;            // default true
  visualizerStyle: 'circular' | 'linear';  // default 'circular'

  // Theme
  theme: 'light' | 'dark' | 'system'; // default 'system'

  // Baby mode
  babyModeVolumeLimit: number;         // 0.0-1.0, default 0.7 (safety cap)

  // Notifications
  practiceReminderEnabled: boolean;    // default false
  practiceReminderTime: string | null; // HH:mm format, e.g., '09:00'
}
```

### Actions

```typescript
interface SettingsActions {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetToDefaults: () => void;
  applySettingsToAudioStore: () => void;  // syncs defaults to audioStore on app launch
}
```

### Selectors

```typescript
const selectMasterVolume = (state: SettingsState) => state.masterVolume;
const selectDefaultBpm = (state: SettingsState) => state.defaultBpm;
const selectPreferredSounds = (state: SettingsState) => ({
  soundA: state.preferredSoundA,
  soundB: state.preferredSoundB,
});
const selectHapticEnabled = (state: SettingsState) => state.hapticEnabled;
const selectTheme = (state: SettingsState) => state.theme;
const selectBabyModeVolumeLimit = (state: SettingsState) => state.babyModeVolumeLimit;
```

### applySettingsToAudioStore

On app launch (after rehydration), `settingsStore` calls this action to push user preferences into the ephemeral `audioStore`:
- Sets `audioStore.bpm` to `settingsStore.defaultBpm`.
- Sets `audioStore.masterVolume` to `settingsStore.masterVolume`.
- Sets `audioStore.soundA` to `settingsStore.preferredSoundA`.
- Sets `audioStore.soundB` to `settingsStore.preferredSoundB`.

This keeps settings as the source of truth for defaults while audio state remains ephemeral.

### Persistence

- Persisted to AsyncStorage under key `settings-store`.

---

## 7. Supabase Integration

### Client Setup

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/supabase';  // generated types

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // not applicable for native
  },
});
```

### Authentication

**Anonymous sign-in (zero friction):**
- On first app launch, after onboarding, automatically call `supabase.auth.signInAnonymously()`.
- Store the returned user ID in `userStore.profile.id`.
- The user is fully functional without providing any personal information.

**Optional email upgrade:**
- In Settings, user can tap "Create Account" to link their anonymous account to an email.
- Uses `supabase.auth.updateUser({ email })` to upgrade.
- `userStore.isAnonymous` flips to `false`.
- All existing data (sessions, progress) is retained under the same user ID.

### Supabase Tables

| Table | Columns | Notes |
|-------|---------|-------|
| `users` | `id`, `display_name`, `email`, `role`, `selected_rhythms`, `genre_preferences`, `created_at`, `updated_at` | Maps to `UserProfile` |
| `sessions` | `id`, `user_id`, `polyrhythm_id`, `started_at`, `ended_at`, `duration`, `bpm_start`, `bpm_end`, `mode`, `disappearing_beat_stage_reached`, `feel_state_after` | Maps to `Session` |
| `lesson_progress` | `id`, `user_id`, `polyrhythm_id`, `current_step`, `completed`, `feel_badge_earned`, `last_attempt_at` | Maps to `LessonProgress` |
| `baby_sessions` | `id`, `baby_profile_id`, `activity_type`, `duration`, `baby_response`, `completed_at` | Maps to `BabySession` |
| `baby_profiles` | `user_id`, `name`, `birth_date`, `current_stage`, `manual_stage_override` | Maps to `BabyProfile` |
| `settings` | `user_id`, `settings_json` | Stores full settings blob |

Row-Level Security (RLS) is enabled on all tables. Policies ensure users can only read/write their own data.

---

## 8. Offline-First Strategy

### Core Principle

The app must be fully functional with zero network connectivity. Supabase is used for backup, cross-device sync, and analytics — not for core functionality.

### Read Path

All feature reads come from local Zustand stores (which rehydrate from AsyncStorage on launch). Features never call Supabase directly.

```
Feature -> Zustand Store (memory) -> AsyncStorage (disk)
                                      ↑ rehydrate on launch
```

### Write Path

All writes go to the local store first, then are queued for remote sync.

```
Feature -> Zustand Store -> AsyncStorage (immediate)
                         -> Sync Queue (async, background)
                                ↓
                           Supabase (when online)
```

### Sync Queue

A dedicated sync service manages a queue of pending mutations.

```typescript
interface SyncQueueItem {
  id: string;                          // UUID
  table: string;                       // Supabase table name
  operation: 'upsert' | 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;       // row data
  createdAt: string;                   // ISO 8601
  retryCount: number;                  // increments on failure, max 5
}
```

- Queue is stored in AsyncStorage under key `sync_queue`.
- Items are added to the queue by store actions (e.g., `endSession` adds a session `insert` to the queue).
- Queue is **not** a Zustand store — it is a simple utility module that reads/writes AsyncStorage directly, to avoid circular dependencies with stores.

### Sync Triggers

The sync service flushes the queue under these conditions:
1. **After each session ends** — `endSession` action triggers a sync attempt.
2. **On app foreground** — `AppState` listener triggers sync when app returns from background.
3. **On connectivity restore** — `NetInfo` listener triggers sync when network comes back online.

### Sync Process

1. Read the queue from AsyncStorage.
2. If queue is empty, return.
3. For each item in order (FIFO):
   a. Attempt the Supabase operation.
   b. If successful: remove item from queue, mark related local record as `syncedToRemote: true`.
   c. If failed due to network: stop processing (will retry on next trigger).
   d. If failed due to conflict or validation: increment `retryCount`. If `retryCount > 5`, log the error and remove from queue (dead letter).
4. Write updated queue back to AsyncStorage.

### Conflict Resolution

MVP uses **last-write-wins** based on timestamps:
- Every synced record includes `updated_at` (local mutation time).
- If the remote record has a newer `updated_at`, the remote version wins (do not overwrite).
- If the local record has a newer `updated_at`, the local version wins (overwrite remote).
- For insert-only data (sessions, baby_sessions), conflicts are not possible — each record has a unique local UUID.

---

## 9. Extension Points (P1+)

### aiResponseCache (Stub)

```typescript
interface AiResponseCacheState {
  cachedResponses: Record<string, {
    response: string;
    cachedAt: string;
    context: Record<string, unknown>;
  }>;
}

interface AiResponseCacheActions {
  cacheResponse: (key: string, response: string, context: Record<string, unknown>) => void;
  getCachedResponse: (key: string) => string | null;
  clearCache: () => void;
}
```

Used by: AI Vocal Coach, AI Stuck Coach — to avoid redundant API calls for similar contexts.

### vocalAnalysisStore (Stub)

```typescript
interface VocalAnalysisState {
  onsetsBySession: Record<string, OnsetRecord[]>;  // keyed by session ID
}

interface VocalAnalysisActions {
  recordOnsets: (sessionId: string, onsets: OnsetRecord[]) => void;
  getOnsetsForSession: (sessionId: string) => OnsetRecord[];
  clearSessionOnsets: (sessionId: string) => void;
}
```

Used by: AI Vocal Coach — stores detected onsets per session for analysis.

### weeklyDigestData (Stub Shape)

```typescript
interface WeeklyDigestInput {
  weekStartDate: string;
  totalSessionCount: number;
  totalPracticeTimeMs: number;
  polyrhythmsPracticed: string[];
  feelStateChanges: Array<{
    polyrhythmId: string;
    from: Session['feelState'];
    to: Session['feelState'];
  }>;
  bestDisappearingBeatStages: Record<string, number>;
  bpmRanges: Record<string, { min: number; max: number }>;
}
```

Used by: AI Progress Narrator — this shape defines what data the narrator needs. The actual computation is a utility function built on `sessionStore` and `lessonStore` selectors.

All stubs are defined as type interfaces and empty store slices. They compile but have no functional implementation until P1/P2.

---

## 10. Boundaries & Constraints

### What the data layer owns:
- All Zustand store definitions (state, actions, selectors)
- AsyncStorage persistence configuration
- Supabase client setup and configuration
- Sync queue and sync service
- Type definitions for all domain entities
- Utility functions for data computation (e.g., `calculateStageFromBirthDate`)

### What the data layer does NOT own:
- UI components or screens
- Audio playback (audioStore is defined in the audio engine foundation)
- Navigation or routing
- AI API calls (features call Claude API directly, but may cache responses via `aiResponseCache`)
- Feature-level business logic

### Import rules:
- Features may import from `@/stores/*` (store hooks, actions, selectors, types).
- Features must NOT import from `@/lib/supabase` directly — all remote operations go through the sync service.
- Stores must NOT import from features or from each other.
- The sync service may import from stores (to mark records as synced) and from the Supabase client.

### Data Flow Summary

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐     ┌───────────┐
│   Feature   │ ──> │ Zustand Store │ ──> │ AsyncStorage │ ──> │ Sync Queue│
│  (UI/Logic) │ <── │   (Memory)    │ <── │   (Disk)     │     │  (Async)  │
└─────────────┘     └───────────────┘     └──────────────┘     └─────┬─────┘
                                                                      │
                                                                      ▼
                                                                ┌───────────┐
                                                                │ Supabase  │
                                                                │ (Remote)  │
                                                                └───────────┘
```
