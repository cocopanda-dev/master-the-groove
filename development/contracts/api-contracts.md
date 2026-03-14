# GrooveCore — API Contracts

**Last Updated:** 2026-03-13
**PRD Version:** 0.1
**Status:** Canonical — all agents must follow these schemas

---

## Overview

This file defines all external API surfaces: Supabase table schemas, auth flow, Claude API call shapes, and offline-first rules. If you are building anything that touches persistence or external services, this is your source of truth.

---

## 1. Supabase Table Schemas

### users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  TEXT,
  email         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('musician', 'parent', 'both')),
  selected_rhythms JSONB NOT NULL DEFAULT '[]'::jsonb,
  genre_preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security: users can only read/write their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_access ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### sessions

```sql
CREATE TABLE sessions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  polyrhythm_id                   TEXT NOT NULL,
  started_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at                        TIMESTAMPTZ,
  duration                        INTEGER NOT NULL DEFAULT 0,  -- seconds
  bpm_start                       INTEGER NOT NULL,
  bpm_end                         INTEGER NOT NULL,
  mode                            TEXT NOT NULL CHECK (mode IN ('free-play', 'lesson', 'disappearing-beat', 'duet-tap')),
  disappearing_beat_stage_reached INTEGER NOT NULL DEFAULT 0,
  feel_state_after                TEXT CHECK (feel_state_after IN ('executing', 'hearing', 'feeling')),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_self_access ON sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### baby_profiles

```sql
CREATE TABLE baby_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  baby_name       TEXT NOT NULL,
  birth_date      DATE NOT NULL,
  current_stage   INTEGER NOT NULL DEFAULT 0 CHECK (current_stage BETWEEN 0 AND 5),
  stage_override  INTEGER DEFAULT NULL CHECK (stage_override IS NULL OR stage_override BETWEEN 0 AND 5),  -- null = use auto-computed stage
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_baby_profiles_user_id ON baby_profiles(user_id);

ALTER TABLE baby_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY baby_profiles_self_access ON baby_profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER baby_profiles_updated_at
  BEFORE UPDATE ON baby_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### baby_sessions

```sql
CREATE TABLE baby_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_profile_id   UUID NOT NULL REFERENCES baby_profiles(id) ON DELETE CASCADE,
  activity_type     TEXT NOT NULL,
  duration          INTEGER NOT NULL DEFAULT 0,  -- seconds
  baby_response     TEXT CHECK (baby_response IN ('calm', 'excited', 'disengaged')),  -- nullable: null when parent dismisses prompt
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_baby_sessions_profile_id ON baby_sessions(baby_profile_id);
CREATE INDEX idx_baby_sessions_completed_at ON baby_sessions(completed_at);

ALTER TABLE baby_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY baby_sessions_self_access ON baby_sessions
  USING (
    baby_profile_id IN (
      SELECT id FROM baby_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    baby_profile_id IN (
      SELECT id FROM baby_profiles WHERE user_id = auth.uid()
    )
  );
```

### lesson_progress

```sql
CREATE TABLE lesson_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  polyrhythm_id     TEXT NOT NULL,
  current_step      INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),
  completed         BOOLEAN NOT NULL DEFAULT false,
  feel_badge_earned BOOLEAN NOT NULL DEFAULT false,
  last_attempt_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX idx_lesson_progress_user_polyrhythm
  ON lesson_progress(user_id, polyrhythm_id);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY lesson_progress_self_access ON lesson_progress
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### settings

```sql
CREATE TABLE settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id),
  settings_json JSONB NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: user can only read/write their own settings row
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_self_access ON settings
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## 2. Auth Flow

### MVP: Anonymous Auth

At MVP, the app uses Supabase anonymous auth. No email or password required. This minimizes friction for first-time users.

```typescript
// On first launch (after onboarding completes)
import { supabase } from '@/lib/supabase';

async function initAnonymousAuth(): Promise<string> {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Anonymous auth failed: ${error.message}`);
  }

  // data.user.id becomes our UserProfile.id
  return data.user.id;
}
```

**Behavior:**
- Called once after onboarding completes
- User ID persisted in AsyncStorage and Zustand `userStore`
- All Supabase queries use this ID for RLS
- If the user reinstalls the app, they get a new anonymous ID (data loss for MVP — acceptable)

**Data Loss Mitigation:** After the user accumulates 5+ sessions, show a non-blocking prompt suggesting account linking. Repeated every 20 sessions until linked. This is MVP scope — not post-MVP.

### Post-MVP: Email/Password Upgrade

```typescript
// Future: link anonymous account to email
async function upgradeToEmailAuth(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error) {
    throw new Error(`Account upgrade failed: ${error.message}`);
  }
}
```

**Post-MVP additions:**
- Email/password sign-up during onboarding (optional)
- "Link account" prompt after N sessions
- Password reset flow
- Account data survives reinstall

---

## 3. Claude API Call Shapes (P1+ Stubs)

All Claude API calls are routed through a single service module at `@/services/ai-service.ts`. No component or store calls the Claude API directly.

### Base Request Shape

```typescript
interface ClaudeAPIRequest {
  /** Always 'claude-sonnet-4' for GrooveCore */
  model: string;

  /** Max tokens for the response */
  max_tokens: number;

  /** System prompt tailored to the specific AI feature */
  system: string;

  /** User message with session context */
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

### AI Vocal Coach (P1)

> See `data-models.md` for type definitions (`AICoachRequest`, `AICoachResponse`).

```typescript
// @/services/ai-service.ts

// System prompt for vocal coach
const VOCAL_COACH_SYSTEM = `You are a rhythm coach for GrooveCore, a polyrhythm training app.
The user just sang/tapped one layer of a polyrhythm while the app played the other.
Analyze their timing data and give 2-3 sentences of coaching.
Be encouraging but specific. Focus on feel, not mechanical precision.
Never mention technical audio terms — speak like a supportive drum teacher.`;

async function getVocalCoachFeedback(
  params: AICoachRequest
): Promise<AICoachResponse> {
  // P1 — stub implementation
  throw new Error('AI Vocal Coach not yet implemented');
}
```

### AI "I'm Stuck" Coach (P1)

```typescript
interface StuckCoachCallParams {
  polyrhythmId: string;
  currentMode: 'lesson' | 'practice' | 'disappearing-beat';
  currentStep: number | null;
  sessionDuration: number;  // seconds spent at current stage
  feelState: FeelState;
  losingLayer: 'A' | 'B';
}

interface StuckCoachCallResult {
  /** 3-5 step micro-lesson */
  steps: string[];
  /** Short summary of what to try */
  summary: string;
}

const STUCK_COACH_SYSTEM = `You are a rhythm coach for GrooveCore.
The user is stuck on a polyrhythm and needs help.
Give a 3-5 step micro-lesson specific to their situation.
Be warm, specific, and practical. Use body-based suggestions (singing, walking, breathing).
Never be condescending. Assume they are capable but need a different approach.`;

async function getStuckCoachAdvice(
  params: StuckCoachCallParams
): Promise<StuckCoachCallResult> {
  // P1 — stub implementation
  throw new Error('AI Stuck Coach not yet implemented');
}
```

### AI Song Recommender (P2)

```typescript
interface SongRecommenderCallParams {
  polyrhythmId: string;
  genrePreferences: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface SongRecommendation {
  title: string;
  artist: string;
  genre: string;
  listenFor: string;
  timestamp: string;
  link: string;
}

interface SongRecommenderCallResult {
  recommendations: SongRecommendation[];
}

async function getSongRecommendations(
  params: SongRecommenderCallParams
): Promise<SongRecommenderCallResult> {
  // P2 — stub implementation
  throw new Error('AI Song Recommender not yet implemented');
}
```

### AI Mnemonic Generator (P2)

> See `data-models.md` for type definitions (`MnemonicRequest`, `MnemonicResponse`).

```typescript
async function generateMnemonics(
  params: MnemonicRequest
): Promise<MnemonicResponse> {
  // P2 — stub implementation
  throw new Error('AI Mnemonic Generator not yet implemented');
}
```

### AI Progress Narrator (P2)

```typescript
interface ProgressNarratorCallParams {
  userId: string;
  weekStart: string;
  sessions: Array<{
    polyrhythmId: string;
    duration: number;
    bpm: number;
    feelState: FeelState | null;
    disappearingBeatStage: number;
  }>;
  feelStateChanges: Record<string, { from: FeelState; to: FeelState }>;
}

interface ProgressNarratorCallResult {
  /** 3-5 sentence narrative summary */
  narrative: string;
  /** One specific suggestion for next week */
  suggestion: string;
}

async function getProgressNarrative(
  params: ProgressNarratorCallParams
): Promise<ProgressNarratorCallResult> {
  // P2 — stub implementation
  throw new Error('AI Progress Narrator not yet implemented');
}
```

### AI Baby Activity Generator (P2)

```typescript
interface BabyActivityCallParams {
  babyAgeMonths: number;
  currentStage: number;
  availableTools: string[];  // e.g. ['spoon', 'pot', 'clapping']
  polyrhythmId: string;
  sessionDurationPreference: number;  // minutes
}

interface BabyActivityCallResult {
  /** Step-by-step activity plan */
  steps: Array<{
    stepNumber: number;
    instruction: string;
    durationSeconds: number;
  }>;
  /** Total activity duration in seconds */
  totalDuration: number;
  /** Safety notes, if any */
  safetyNotes: string[];
}

async function generateBabyActivity(
  params: BabyActivityCallParams
): Promise<BabyActivityCallResult> {
  // P2 — stub implementation
  throw new Error('AI Baby Activity Generator not yet implemented');
}
```

---

## 4. Offline-First Rules

GrooveCore is offline-first for all core functionality. The app must work without a network connection. Supabase is used for backup and cross-device sync, not as a primary data source.

### Local Storage (AsyncStorage Keys)

All local data is stored via AsyncStorage with the following key conventions:

```typescript
// Key prefix: 'groovecore:'
const STORAGE_KEYS = {
  // Auth
  USER_ID:          'groovecore:user-id',
  AUTH_TOKEN:        'groovecore:auth-token',

  // Profile
  USER_PROFILE:     'groovecore:user-profile',
  BABY_PROFILES:    'groovecore:baby-profiles',

  // Session data
  SESSIONS:         'groovecore:sessions',
  BABY_SESSIONS:    'groovecore:baby-sessions',

  // Progress
  LESSON_PROGRESS:  'groovecore:lesson-progress',

  // Settings
  SETTINGS:         'groovecore:settings',

  // Sync metadata
  LAST_SYNC_AT:     'groovecore:last-sync-at',
  SYNC_QUEUE:       'groovecore:sync-queue',

  // Onboarding
  ONBOARDING_COMPLETE: 'groovecore:onboarding-complete',

  // AI cache (P2)
  AI_RESPONSE_CACHE:   'groovecore:ai-cache',
} as const;
```

### What Caches Locally vs. What Syncs to Supabase

| Data | Local (AsyncStorage) | Syncs to Supabase | Priority |
|------|---------------------|-------------------|----------|
| UserProfile | Yes (primary) | Yes (backup) | Immediate |
| Sessions | Yes (primary) | Yes (backup) | Background |
| BabyProfiles | Yes (primary) | Yes (backup) | Immediate |
| BabySessions | Yes (primary) | Yes (backup) | Background |
| LessonProgress | Yes (primary) | Yes (backup) | Background |
| Settings | Yes (primary) | Yes (backup) | Background |
| Sync queue | Yes (only) | No | N/A |
| AI response cache | Yes (only) | No | N/A |

### Sync Queue Architecture

```typescript
/**
 * Canonical SyncQueueItem shape. All sync code must use these exact field names:
 * - operation: 'upsert' | 'delete' (not 'insert'/'update')
 * - payload (not 'data')
 * - queuedAt (not 'createdAt')
 */
interface SyncQueueItem {
  /** UUID for this queue entry */
  id: string;

  /** Which table to sync to */
  table: 'users' | 'sessions' | 'baby_profiles' | 'baby_sessions' | 'lesson_progress' | 'settings';

  /** The operation */
  operation: 'upsert' | 'delete';

  /** The row data to sync */
  payload: Record<string, unknown>;

  /** ISO 8601 — when this item was queued */
  queuedAt: string;

  /** Number of failed sync attempts */
  retryCount: number;
}
```

### Write Flow

```
User action
  -> Zustand store update (immediate, optimistic)
  -> AsyncStorage write (immediate, local persistence)
  -> Add to sync queue
  -> If online: flush sync queue to Supabase
  -> If offline: queue stays, flushed on reconnection
```

### Conflict Resolution (MVP)

**Strategy: Last-Write-Wins**

For MVP, the most recent write (by `updated_at` timestamp) wins. This is simple and sufficient because:

- Single-user app (no collaboration)
- Only one device at MVP (no cross-device conflicts)
- Session data is append-only (no edits)
- Profile data changes rarely

```typescript
// Conflict resolution during sync
async function syncItem(item: SyncQueueItem): Promise<void> {
  const { table, operation, payload } = item;

  if (operation === 'upsert') {
    const { error } = await supabase
      .from(table)
      .upsert(payload, {
        onConflict: 'id',
        // Last-write-wins: Supabase upsert replaces existing row
      });

    if (error) throw error;
  }

  if (operation === 'delete') {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', payload.id);

    if (error) throw error;
  }
}
```

### Reconnection Behavior

```typescript
import NetInfo from '@react-native-community/netinfo';

// Listen for connectivity changes
NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable) {
    flushSyncQueue();
  }
});

async function flushSyncQueue(): Promise<void> {
  const queue = await getQueueFromStorage();

  // Sort by queuedAt ascending (oldest first)
  const sorted = queue.sort((a, b) =>
    a.queuedAt.localeCompare(b.queuedAt)
  );

  for (const item of sorted) {
    try {
      await syncItem(item);
      await removeFromQueue(item.id);
    } catch (error) {
      item.retryCount += 1;

      if (item.retryCount >= 5) {
        // After 5 failures, move to dead-letter queue (persisted in AsyncStorage
        // under `@groovecore/sync-dead-letter`). Items in the dead-letter queue
        // can be retried manually or on next successful sync.
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s.
        console.error(`Sync failed permanently for ${item.table}:${item.id} — moved to dead-letter queue`);
        await moveToDeadLetterQueue(item);
        await removeFromQueue(item.id);
      } else {
        // Exponential backoff: delay = 2^(retryCount-1) seconds (1s, 2s, 4s, 8s, 16s)
        await updateQueueItem(item);
      }

      // Stop flushing on first error (network may be gone)
      break;
    }
  }
}
```

### Initial Data Load (App Startup)

```
App opens
  -> Load all data from AsyncStorage into Zustand stores
  -> UI renders immediately from local data
  -> In background: check Supabase for newer data (if online)
  -> If Supabase has newer data: merge (last-write-wins by updated_at)
  -> Update local stores + AsyncStorage with merged result
```

```typescript
async function initializeDataLayer(): Promise<void> {
  // 1. Load local data (fast, synchronous-ish)
  const localProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (localProfile) {
    userStore.getState().setProfile(JSON.parse(localProfile));
  }

  // 2. Background sync (non-blocking)
  if (await isOnline()) {
    backgroundSync().catch(console.error);
  }
}
```

---

## 5. Supabase Client Configuration

```typescript
// @/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // Not applicable for React Native
  },
});
```

**Note:** Auth tokens use `expo-secure-store` (encrypted storage) for security. Application data uses `AsyncStorage` (unencrypted) via Zustand persist middleware.

**Environment Variables:**
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — **Never in client code.** Only used in backend scripts for migrations.

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-03-13 | Initial creation — all MVP schemas + P1/P2 AI stubs | — |
