# Data Layer — Tasks

**Read before starting:** `contracts/data-models.md`, `contracts/api-contracts.md`, `contracts/coding-conventions.md`

---

## Setup

- [ ] **Task 1: Create store module structure**
  Create files: `src/stores/use-user-store.ts`, `use-session-store.ts`, `use-lesson-store.ts`, `use-baby-store.ts`, `use-settings-store.ts`. Each file exports a Zustand store with persist middleware and AsyncStorage. Initial state matches data-models.md types. All stores compile with no errors.

- [ ] **Task 2: Create shared types file**
  Create `src/types/index.ts` mirroring all interfaces from `contracts/data-models.md`. Export all types. Ensure all stores import types from this central file.

- [ ] **Task 3: Set up Supabase client**
  Create `src/lib/supabase/client.ts`. Initialize Supabase client with URL and anon key from env vars (`.env` file with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Export typed client. Add `.env.example` with placeholder values.

## Stores

- [ ] **Task 4: Implement userStore**
  State: `profile: UserProfile | null`, `isOnboarded: boolean`, `isAnonymous: boolean`. Actions: `setProfile`, `completeOnboarding`, `updateGenrePreferences`, `reset`. Persist all fields. Acceptance: store can set profile, toggle onboarded, update genres, and survives app restart via AsyncStorage.

- [ ] **Task 5: Implement sessionStore**
  State: `currentSession: Session | null`, `sessionHistory: Session[]`. Actions: `startSession(polyrhythmId)` creates a new session with startedAt timestamp, `updateSession(partial)` for live updates (BPM, stage reached), `endSession()` finalizes with endedAt + duration calc + pushes to history, `setFeelState(sessionId, feelState)`. Persist sessionHistory (not currentSession). Acceptance: full session lifecycle works — start, update during play, end, feel state prompt, appears in history.

- [ ] **Task 6: Implement lessonStore**
  State: `progressByPolyrhythm: Record<string, LessonProgress>`. Actions: `startLesson(polyrhythmId)` creates or resumes progress, `advanceStep(polyrhythmId)` increments currentStep, `completeLesson(polyrhythmId)` sets completed + timestamps, `awardFeelBadge(polyrhythmId)`. Persist all. Acceptance: can track a full lesson from step 1 through completion with badge.

- [ ] **Task 7: Implement babyStore**
  State: `babyProfile: BabyProfile | null`, `babySessions: BabySession[]`. Actions: `setBabyProfile(profile)`, `updateStage(stage)` with override flag, `logBabySession(session)` appends to babySessions. Persist all. Acceptance: can create baby profile, log sessions with response, compute current stage from birth date.

- [ ] **Task 8: Implement settingsStore**
  State: `masterVolume: number`, `defaultBpm: number`, `preferredSoundA: SoundId`, `preferredSoundB: SoundId`, `hapticEnabled: boolean`, `keepScreenAwake: boolean`. Actions: `updateSetting(key, value)`. Persist all. Defaults: volume 0.8, bpm 100, sounds click/clave, haptic true, awake true. Acceptance: settings persist across restarts, defaults applied on first launch.

## Supabase Sync

- [ ] **Task 9: Implement anonymous auth**
  In `src/lib/supabase/auth.ts`: `signInAnonymously()` on first launch if no existing session. Store Supabase session in secure storage. On app launch, check for existing session and restore it. Acceptance: app gets a Supabase anonymous user ID without any user friction.

- [ ] **Task 10: Create Supabase table migration SQL**
  Write SQL in `src/lib/supabase/migrations/001_initial.sql` for tables: `users`, `sessions`, `baby_profiles`, `baby_sessions`, `lesson_progress`. Schema matches `contracts/api-contracts.md`. Include RLS policies: users can only read/write their own rows.

- [ ] **Task 11: Implement sync service**
  Create `src/lib/supabase/sync.ts`. Sync queue stored in AsyncStorage under key `sync_queue`. Each entry: `{ table, operation: 'insert'|'update', data, timestamp }`. `queueSync(entry)` adds to queue. `flushSyncQueue()` processes entries in order, removes on success. Triggers: after session end, on app foreground (AppState listener), on connectivity restore (NetInfo listener). Acceptance: actions taken offline appear in Supabase when connectivity returns.

- [ ] **Task 12: Wire stores to sync service**
  After `endSession()`, `logBabySession()`, and `completeLesson()` actions, automatically queue a sync entry. Use Zustand `subscribe` to trigger sync on relevant state changes. Acceptance: completing a practice session offline → entry appears in sync queue → flushed to Supabase when online.

## Extension Points

- [ ] **Task 13: Add stub store slices for P1+**
  Create placeholder interfaces in `src/types/index.ts` for: `AIInteraction`, `VocalAnalysisData`, `WeeklyDigest`. Create empty store stub `src/stores/use-ai-store.ts` with no-op actions (returns empty data). Acceptance: stub compiles, can be imported, returns empty/default values.

## Testing

- [ ] **Task 14: Unit tests for store actions**
  Test each store's actions: create, update, finalize flows. Test sessionStore lifecycle (start → update → end → history). Test lessonStore progression (start → advance steps → complete → badge). Test babyStore stage calculation from birth date. Acceptance: all store action tests pass.

- [ ] **Task 15: Integration test for sync queue**
  Test: queue entries when offline, mock Supabase calls, verify flush processes in order and clears queue. Test retry on failure (entry stays in queue). Acceptance: sync queue integration test passes.
