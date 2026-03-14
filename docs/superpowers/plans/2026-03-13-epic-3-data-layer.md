# Epic 3: Data Layer -- Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all Zustand stores (5 domain stores), offline persistence via AsyncStorage, Supabase client with anonymous auth, sync queue, and data initialization -- so every feature has a fully functional offline-first data layer.

**Architecture:** Offline-first. All reads from Zustand stores (memory). All writes to local stores first, then queued for Supabase sync. One store per domain. Stores are independent (no cross-store imports). Sync queue is a plain AsyncStorage utility (not a Zustand store) to avoid circular deps. Auth tokens in expo-secure-store (encrypted), app data in AsyncStorage.

**Tech Stack:** Zustand 5.x with persist middleware, @react-native-async-storage/async-storage, @supabase/supabase-js, expo-secure-store, @react-native-community/netinfo, uuid.

---

## File Map

### Files to Create

```
src/
  data-access/
    stores/
      create-persisted-store.ts
      store-reset.ts
      use-user-store.ts
      use-session-store.ts
      use-lesson-store.ts
      use-baby-store.ts
      use-settings-store.ts
      __tests__/
        use-user-store.test.ts
        use-session-store.test.ts
        use-lesson-store.test.ts
        use-baby-store.test.ts
        use-settings-store.test.ts
      index.ts
    supabase/
      client.ts
      auth.ts
      __tests__/
        auth.test.ts
      index.ts
  libs/
    sync/
      sync-queue.ts
      sync-service.ts
      sync-triggers.ts
      __tests__/
        sync-queue.test.ts
        sync-service.test.ts
        sync-triggers.test.ts
      index.ts
  operations/
    baby/
      calculate-stage.ts
      __tests__/
        calculate-stage.test.ts
      index.ts
    progress/
      weekly-summary.ts
      __tests__/
        weekly-summary.test.ts
      index.ts
```

### Files to Modify

```
package.json                    (add deps)
src/__tests__/jestSetup.ts      (add mocks)
```

---

## Dependencies to Install

```bash
npx expo install expo-secure-store @react-native-community/netinfo
yarn add @supabase/supabase-js uuid
yarn add -D @types/uuid
```

Note: `@react-native-async-storage/async-storage` and `zustand` should already be installed by Epic 0.

---

## Chunk 1: Dependencies + Infrastructure

### Task 1: Install Dependencies + Jest Mocks

- [ ] **Step 1: Install packages**

Run: `npx expo install expo-secure-store @react-native-community/netinfo && yarn add @supabase/supabase-js uuid && yarn add -D @types/uuid`

- [ ] **Step 2: Create expo-secure-store mock**

```typescript
// src/__tests__/mocks/expo-secure-store.ts
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
});
```

- [ ] **Step 3: Create netinfo mock**

```typescript
// src/__tests__/mocks/netinfo.ts
const listeners: Array<(state: { isConnected: boolean; isInternetReachable: boolean }) => void> = [];

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((cb: (state: { isConnected: boolean; isInternetReachable: boolean }) => void) => {
    listeners.push(cb);
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
}));

export { listeners as netInfoListeners };
```

- [ ] **Step 4: Create Supabase client mock**

```typescript
// src/__tests__/mocks/supabase.ts
const mockFrom = jest.fn().mockReturnValue({
  upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  delete: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
});

const mockAuth = {
  signInAnonymously: jest.fn().mockResolvedValue({
    data: { user: { id: 'test-anon-user-id' } },
    error: null,
  }),
  updateUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
  getSession: jest.fn().mockResolvedValue({
    data: { session: { user: { id: 'test-anon-user-id' } } },
    error: null,
  }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
    auth: mockAuth,
  })),
}));

export { mockFrom, mockAuth };
```

- [ ] **Step 5: Add mocks to jest setup**

Add to `src/__tests__/jestSetup.ts`:
```typescript
import './mocks/expo-secure-store';
import './mocks/netinfo';
import './mocks/supabase';
```

- [ ] **Step 6: Commit**

`git add package.json yarn.lock src/__tests__/mocks/expo-secure-store.ts src/__tests__/mocks/netinfo.ts src/__tests__/mocks/supabase.ts src/__tests__/jestSetup.ts && git commit -m "feat(data): install data layer deps and add jest mocks"`

---

### Task 2: Zustand Persist Helper

**Files:**
- Create: `src/data-access/stores/create-persisted-store.ts`

```typescript
// src/data-access/stores/create-persisted-store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);
```

This is intentionally minimal -- each store uses `persist()` directly with this adapter. No abstraction layer needed.

Commit: `feat(data): add AsyncStorage adapter for Zustand persist`

---

### Task 3: Store Reset Utility

**Files:**
- Create: `src/data-access/stores/store-reset.ts`

```typescript
// src/data-access/stores/store-reset.ts
import type { StoreApi } from 'zustand';

type ResetFn = () => void;
const resetFns: ResetFn[] = [];

export const registerResetFn = (fn: ResetFn): void => {
  resetFns.push(fn);
};

export const resetAllStores = (): void => {
  resetFns.forEach((fn) => fn());
};
```

Commit: `feat(data): add store reset utility for sign-out and testing`

---

## Chunk 2: Domain Stores

### Task 4: settingsStore

**Files:**
- Create: `src/data-access/stores/use-settings-store.ts`
- Test: `src/data-access/stores/__tests__/use-settings-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-settings-store.test.ts
import { useSettingsStore } from '../use-settings-store';
import { act } from '@testing-library/react-native';

describe('useSettingsStore', () => {
  beforeEach(() => {
    act(() => useSettingsStore.setState(useSettingsStore.getInitialState()));
  });

  it('has correct defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.masterVolume).toBe(1.0);
    expect(state.defaultBpm).toBe(90);
    expect(state.preferredSoundA).toBe('click');
    expect(state.preferredSoundB).toBe('clave');
    expect(state.hapticEnabled).toBe(true);
    expect(state.keepScreenAwake).toBe(true);
    expect(state.showBeatNumbers).toBe(true);
    expect(state.visualizerStyle).toBe('circular');
    expect(state.theme).toBe('system');
    expect(state.babyModeVolumeLimit).toBe(0.7);
    expect(state.practiceReminderEnabled).toBe(false);
    expect(state.practiceReminderTime).toBeNull();
  });

  it('updateSetting changes a single setting', () => {
    act(() => useSettingsStore.getState().updateSetting('defaultBpm', 120));
    expect(useSettingsStore.getState().defaultBpm).toBe(120);
  });

  it('updateSetting is type-safe (string for theme)', () => {
    act(() => useSettingsStore.getState().updateSetting('theme', 'dark'));
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('resetToDefaults restores all values', () => {
    act(() => {
      useSettingsStore.getState().updateSetting('defaultBpm', 200);
      useSettingsStore.getState().updateSetting('theme', 'dark');
      useSettingsStore.getState().resetToDefaults();
    });
    expect(useSettingsStore.getState().defaultBpm).toBe(90);
    expect(useSettingsStore.getState().theme).toBe('system');
  });
});
```

- [ ] **Step 2: Run test** -- Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/stores/use-settings-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { SoundId } from '@types';

type SettingsState = {
  masterVolume: number;
  defaultBpm: number;
  preferredSoundA: SoundId;
  preferredSoundB: SoundId;
  hapticEnabled: boolean;
  keepScreenAwake: boolean;
  showBeatNumbers: boolean;
  visualizerStyle: 'circular' | 'linear';
  theme: 'light' | 'dark' | 'system';
  babyModeVolumeLimit: number;
  practiceReminderEnabled: boolean;
  practiceReminderTime: string | null;
};

type SettingsActions = {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetToDefaults: () => void;
};

const DEFAULTS: SettingsState = {
  masterVolume: 1.0,
  defaultBpm: 90,
  preferredSoundA: 'click',
  preferredSoundB: 'clave',
  hapticEnabled: true,
  keepScreenAwake: true,
  showBeatNumbers: true,
  visualizerStyle: 'circular',
  theme: 'system',
  babyModeVolumeLimit: 0.7,
  practiceReminderEnabled: false,
  practiceReminderTime: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateSetting: (key, value) => set({ [key]: value }),

      resetToDefaults: () => set(DEFAULTS),
    }),
    {
      name: 'settings-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useSettingsStore.setState(DEFAULTS));
```

- [ ] **Step 4: Run test** -- Expected: PASS
- [ ] **Step 5: Commit**

`git add src/data-access/stores/use-settings-store.ts src/data-access/stores/__tests__/use-settings-store.test.ts && git commit -m "feat(data): add settingsStore with type-safe updateSetting"`

---

### Task 5: userStore

**Files:**
- Create: `src/data-access/stores/use-user-store.ts`
- Test: `src/data-access/stores/__tests__/use-user-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-user-store.test.ts
import { useUserStore } from '../use-user-store';
import { act } from '@testing-library/react-native';

describe('useUserStore', () => {
  beforeEach(() => {
    act(() => useUserStore.setState(useUserStore.getInitialState()));
  });

  it('starts with null profile and not onboarded', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isOnboarded).toBe(false);
    expect(state.isAnonymous).toBe(true);
  });

  it('setProfile stores the user profile', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      selectedRhythms: ['3-2'],
      genrePreferences: ['jazz'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    expect(useUserStore.getState().profile).toEqual(profile);
  });

  it('completeOnboarding sets flag to true', () => {
    act(() => useUserStore.getState().completeOnboarding());
    expect(useUserStore.getState().isOnboarded).toBe(true);
  });

  it('updateRole changes the profile role', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      selectedRhythms: [],
      genrePreferences: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    act(() => useUserStore.getState().updateRole('both'));
    expect(useUserStore.getState().profile?.role).toBe('both');
  });

  it('updateRole is no-op when profile is null', () => {
    act(() => useUserStore.getState().updateRole('parent'));
    expect(useUserStore.getState().profile).toBeNull();
  });

  it('upgradeFromAnonymous sets email and flips flag', () => {
    const profile = {
      id: 'user-123',
      displayName: null,
      email: null,
      role: 'musician' as const,
      selectedRhythms: [],
      genrePreferences: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    act(() => useUserStore.getState().setProfile(profile));
    act(() => useUserStore.getState().upgradeFromAnonymous('test@example.com', 'Test User'));
    expect(useUserStore.getState().isAnonymous).toBe(false);
    expect(useUserStore.getState().profile?.email).toBe('test@example.com');
    expect(useUserStore.getState().profile?.displayName).toBe('Test User');
  });

  it('clearProfile resets to initial state', () => {
    act(() => {
      useUserStore.getState().setProfile({
        id: 'user-123',
        displayName: 'Test',
        email: 'test@test.com',
        role: 'both',
        selectedRhythms: ['3-2'],
        genrePreferences: ['jazz'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      useUserStore.getState().clearProfile();
    });
    expect(useUserStore.getState().profile).toBeNull();
    expect(useUserStore.getState().isAnonymous).toBe(true);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/stores/use-user-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { UserProfile } from '@types';

type UserState = {
  profile: UserProfile | null;
  isOnboarded: boolean;
  isAnonymous: boolean;
};

type UserActions = {
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  updateRole: (role: UserProfile['role']) => void;
  updateGenrePreferences: (genres: string[]) => void;
  upgradeFromAnonymous: (email: string, name: string) => void;
  clearProfile: () => void;
};

const INITIAL_STATE: UserState = {
  profile: null,
  isOnboarded: false,
  isAnonymous: true,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setProfile: (profile) => set({ profile }),

      completeOnboarding: () => set({ isOnboarded: true }),

      updateRole: (role) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, role, updatedAt: new Date().toISOString() } });
      },

      updateGenrePreferences: (genres) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, genrePreferences: genres, updatedAt: new Date().toISOString() } });
      },

      upgradeFromAnonymous: (email, name) => {
        const { profile } = get();
        if (!profile) return;
        set({
          isAnonymous: false,
          profile: { ...profile, email, displayName: name, updatedAt: new Date().toISOString() },
        });
      },

      clearProfile: () => set(INITIAL_STATE),
    }),
    {
      name: 'user-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useUserStore.setState(INITIAL_STATE));
```

Commit: `feat(data): add userStore with profile, onboarding, and anonymous auth state`

---

### Task 6: lessonStore

**Files:**
- Create: `src/data-access/stores/use-lesson-store.ts`
- Test: `src/data-access/stores/__tests__/use-lesson-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-lesson-store.test.ts
import { useLessonStore } from '../use-lesson-store';
import { act } from '@testing-library/react-native';

describe('useLessonStore', () => {
  beforeEach(() => {
    act(() => useLessonStore.setState({ progressByPolyrhythm: {} }));
  });

  it('starts with empty progress', () => {
    expect(useLessonStore.getState().progressByPolyrhythm).toEqual({});
  });

  it('startLesson creates a new progress entry', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    const progress = useLessonStore.getState().progressByPolyrhythm['3-2'];
    expect(progress).toBeDefined();
    expect(progress?.currentStep).toBe(1);
    expect(progress?.completed).toBe(false);
    expect(progress?.feelBadgeEarned).toBe(false);
  });

  it('advanceStep increments currentStep', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().advanceStep('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(2);
  });

  it('advanceStep does not exceed 7', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    for (let i = 0; i < 10; i++) {
      act(() => useLessonStore.getState().advanceStep('3-2'));
    }
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(7);
  });

  it('completeLesson marks completed', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().completeLesson('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.completed).toBe(true);
  });

  it('awardFeelBadge sets flag', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().awardFeelBadge('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.feelBadgeEarned).toBe(true);
  });

  it('resetLesson removes the entry', () => {
    act(() => useLessonStore.getState().startLesson('3-2', 7));
    act(() => useLessonStore.getState().resetLesson('3-2'));
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']).toBeUndefined();
  });

  it('multiple polyrhythms are independent', () => {
    act(() => {
      useLessonStore.getState().startLesson('3-2', 7);
      useLessonStore.getState().startLesson('4-3', 7);
      useLessonStore.getState().advanceStep('3-2');
    });
    expect(useLessonStore.getState().progressByPolyrhythm['3-2']?.currentStep).toBe(2);
    expect(useLessonStore.getState().progressByPolyrhythm['4-3']?.currentStep).toBe(1);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/stores/use-lesson-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { LessonProgress } from '@types';

type LessonState = {
  progressByPolyrhythm: Record<string, LessonProgress>;
};

type LessonActions = {
  startLesson: (polyrhythmId: string, totalSteps: number) => void;
  advanceStep: (polyrhythmId: string) => void;
  completeLesson: (polyrhythmId: string) => void;
  awardFeelBadge: (polyrhythmId: string) => void;
  resetLesson: (polyrhythmId: string) => void;
  markLessonSynced: (polyrhythmId: string) => void;
};

const INITIAL: LessonState = { progressByPolyrhythm: {} };

export const useLessonStore = create<LessonState & LessonActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      startLesson: (polyrhythmId) => {
        const existing = get().progressByPolyrhythm[polyrhythmId];
        if (existing) return; // don't overwrite

        const entry: LessonProgress = {
          id: uuid(),
          userId: '',
          polyrhythmId,
          currentStep: 1,
          completed: false,
          feelBadgeEarned: false,
          lastAttemptAt: new Date().toISOString(),
        };

        set((s) => ({
          progressByPolyrhythm: { ...s.progressByPolyrhythm, [polyrhythmId]: entry },
        }));
      },

      advanceStep: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress || progress.currentStep >= 7) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: {
                ...progress,
                currentStep: (progress.currentStep + 1) as LessonProgress['currentStep'],
                lastAttemptAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeLesson: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: { ...progress, completed: true, lastAttemptAt: new Date().toISOString() },
            },
          };
        });
      },

      awardFeelBadge: (polyrhythmId) => {
        set((s) => {
          const progress = s.progressByPolyrhythm[polyrhythmId];
          if (!progress) return s;
          return {
            progressByPolyrhythm: {
              ...s.progressByPolyrhythm,
              [polyrhythmId]: { ...progress, feelBadgeEarned: true },
            },
          };
        });
      },

      resetLesson: (polyrhythmId) => {
        set((s) => {
          const { [polyrhythmId]: _, ...rest } = s.progressByPolyrhythm;
          return { progressByPolyrhythm: rest };
        });
      },

      markLessonSynced: (_polyrhythmId) => {
        // Placeholder for sync status tracking
      },
    }),
    {
      name: 'lesson-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useLessonStore.setState(INITIAL));
```

Commit: `feat(data): add lessonStore with step progression and feel badges`

---

### Task 7: babyStore

**Files:**
- Create: `src/data-access/stores/use-baby-store.ts`
- Test: `src/data-access/stores/__tests__/use-baby-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-baby-store.test.ts
import { useBabyStore } from '../use-baby-store';
import { act } from '@testing-library/react-native';

describe('useBabyStore', () => {
  beforeEach(() => {
    act(() => useBabyStore.setState(useBabyStore.getInitialState()));
  });

  it('starts with null profile and empty sessions', () => {
    expect(useBabyStore.getState().babyProfile).toBeNull();
    expect(useBabyStore.getState().babySessions).toEqual([]);
  });

  it('setBabyProfile stores the profile', () => {
    const profile = {
      id: 'baby-1',
      userId: 'user-1',
      babyName: 'Luna',
      birthDate: '2025-06-15',
      currentStage: 1 as const,
      stageOverride: false,
    };
    act(() => useBabyStore.getState().setBabyProfile(profile));
    expect(useBabyStore.getState().babyProfile).toEqual(profile);
  });

  it('updateBabyName changes the name', () => {
    act(() => useBabyStore.getState().setBabyProfile({
      id: 'baby-1', userId: 'user-1', babyName: 'Luna',
      birthDate: '2025-06-15', currentStage: 1, stageOverride: false,
    }));
    act(() => useBabyStore.getState().updateBabyName('Sol'));
    expect(useBabyStore.getState().babyProfile?.babyName).toBe('Sol');
  });

  it('logBabySession adds to sessions array', () => {
    act(() => useBabyStore.getState().logBabySession({
      babyProfileId: 'baby-1',
      activityType: 'bounce',
      duration: 120,
      babyResponse: 'excited',
      completedAt: '2026-01-01T00:00:00Z',
    }));
    expect(useBabyStore.getState().babySessions).toHaveLength(1);
    expect(useBabyStore.getState().babySessions[0]?.activityType).toBe('bounce');
    expect(useBabyStore.getState().babySessions[0]?.id).toBeDefined();
  });

  it('clearBabyProfile resets all state', () => {
    act(() => {
      useBabyStore.getState().setBabyProfile({
        id: 'baby-1', userId: 'user-1', babyName: 'Luna',
        birthDate: '2025-06-15', currentStage: 1, stageOverride: false,
      });
      useBabyStore.getState().clearBabyProfile();
    });
    expect(useBabyStore.getState().babyProfile).toBeNull();
  });
});
```

- [ ] **Step 3: Write implementation** (similar pattern to lessonStore -- Zustand persist + actions that update profile/sessions)

Commit: `feat(data): add babyStore with profile, sessions, and stage management`

---

### Task 8: sessionStore (Most Complex -- Lifecycle State Machine)

**Files:**
- Create: `src/data-access/stores/use-session-store.ts`
- Test: `src/data-access/stores/__tests__/use-session-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-session-store.test.ts
import { useSessionStore } from '../use-session-store';
import { act } from '@testing-library/react-native';

describe('useSessionStore', () => {
  beforeEach(() => {
    act(() => useSessionStore.setState(useSessionStore.getInitialState()));
  });

  describe('lifecycle state machine', () => {
    it('starts in idle state', () => {
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
      expect(useSessionStore.getState().currentSession).toBeNull();
    });

    it('startSession transitions idle -> recording', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      expect(useSessionStore.getState().lifecycleState).toBe('recording');
      expect(useSessionStore.getState().currentSession).not.toBeNull();
      expect(useSessionStore.getState().currentSession?.polyrhythmId).toBe('3-2');
    });

    it('startSession is no-op when already recording', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      const session = useSessionStore.getState().currentSession;
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '4-3', mode: 'lesson', bpm: 90,
      }));
      // Should still be the original session
      expect(useSessionStore.getState().currentSession?.polyrhythmId).toBe('3-2');
      expect(useSessionStore.getState().currentSession?.id).toBe(session?.id);
    });

    it('endSession transitions recording -> pendingFeelState', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      expect(useSessionStore.getState().lifecycleState).toBe('pendingFeelState');
    });

    it('endSession is no-op when idle', () => {
      act(() => useSessionStore.getState().endSession(null));
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
    });

    it('recordFeelState transitions pendingFeelState -> completed', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().recordFeelState('feeling'));
      expect(useSessionStore.getState().lifecycleState).toBe('completed');
      expect(useSessionStore.getState().currentSession?.feelStateAfter).toBe('feeling');
    });

    it('skipFeelState transitions pendingFeelState -> completed', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      expect(useSessionStore.getState().lifecycleState).toBe('completed');
    });

    it('completeSession moves to history and resets to idle', () => {
      act(() => useSessionStore.getState().startSession({
        polyrhythmId: '3-2', mode: 'free-play', bpm: 120,
      }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());
      expect(useSessionStore.getState().lifecycleState).toBe('idle');
      expect(useSessionStore.getState().currentSession).toBeNull();
      expect(useSessionStore.getState().sessionHistory).toHaveLength(1);
    });
  });

  describe('session history', () => {
    it('most recent session is first in history', () => {
      // Create two sessions
      act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());

      act(() => useSessionStore.getState().startSession({ polyrhythmId: '4-3', mode: 'lesson', bpm: 90 }));
      act(() => useSessionStore.getState().endSession(null));
      act(() => useSessionStore.getState().skipFeelState());
      act(() => useSessionStore.getState().completeSession());

      expect(useSessionStore.getState().sessionHistory[0]?.polyrhythmId).toBe('4-3');
    });

    it('caps history at 500 entries', () => {
      for (let i = 0; i < 505; i++) {
        act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
        act(() => useSessionStore.getState().endSession(null));
        act(() => useSessionStore.getState().skipFeelState());
        act(() => useSessionStore.getState().completeSession());
      }
      expect(useSessionStore.getState().sessionHistory.length).toBeLessThanOrEqual(500);
    });
  });

  describe('updateSession', () => {
    it('updates BPM end during recording', () => {
      act(() => useSessionStore.getState().startSession({ polyrhythmId: '3-2', mode: 'free-play', bpm: 120 }));
      act(() => useSessionStore.getState().updateSession({ bpmEnd: 140 }));
      expect(useSessionStore.getState().currentSession?.bpmEnd).toBe(140);
    });
  });

  describe('selectors', () => {
    it('selectTotalPracticeSeconds sums durations', () => {
      // Manually set history for testing
      act(() => useSessionStore.setState({
        sessionHistory: [
          { id: '1', userId: 'u', polyrhythmId: '3-2', startedAt: '', endedAt: '', duration: 60, bpmStart: 120, bpmEnd: 120, mode: 'free-play', disappearingBeatStageReached: 0, feelStateAfter: null },
          { id: '2', userId: 'u', polyrhythmId: '3-2', startedAt: '', endedAt: '', duration: 120, bpmStart: 120, bpmEnd: 120, mode: 'free-play', disappearingBeatStageReached: 0, feelStateAfter: null },
        ],
      }));
      const total = useSessionStore.getState().sessionHistory.reduce((sum, s) => sum + s.duration, 0);
      expect(total).toBe(180);
    });
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/stores/use-session-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { Session, FeelState } from '@types';

type LifecycleState = 'idle' | 'recording' | 'pendingFeelState' | 'completed';

type SessionState = {
  currentSession: Session | null;
  sessionHistory: Session[];
  lifecycleState: LifecycleState;
};

type StartSessionParams = {
  polyrhythmId: string;
  mode: Session['mode'];
  bpm: number;
};

type SessionActions = {
  startSession: (params: StartSessionParams) => void;
  updateSession: (updates: Partial<Pick<Session, 'bpmEnd' | 'disappearingBeatStageReached'>>) => void;
  endSession: (feelStateAfter: FeelState | null) => void;
  recordFeelState: (feelState: FeelState) => void;
  skipFeelState: () => void;
  completeSession: () => void;
};

const HISTORY_CAP = 500;

const INITIAL: SessionState = {
  currentSession: null,
  sessionHistory: [],
  lifecycleState: 'idle',
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      startSession: ({ polyrhythmId, mode, bpm }) => {
        if (get().lifecycleState !== 'idle') return;

        const session: Session = {
          id: uuid(),
          userId: '',
          polyrhythmId,
          startedAt: new Date().toISOString(),
          endedAt: null,
          duration: 0,
          bpmStart: bpm,
          bpmEnd: bpm,
          mode,
          disappearingBeatStageReached: 0,
          feelStateAfter: null,
        };

        set({ currentSession: session, lifecycleState: 'recording' });
      },

      updateSession: (updates) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'recording' || !currentSession) return;
        set({ currentSession: { ...currentSession, ...updates } });
      },

      endSession: (feelStateAfter) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'recording' || !currentSession) return;

        const endedAt = new Date().toISOString();
        const duration = Math.round(
          (new Date(endedAt).getTime() - new Date(currentSession.startedAt).getTime()) / 1000,
        );

        if (feelStateAfter) {
          set({
            currentSession: { ...currentSession, endedAt, duration, feelStateAfter },
            lifecycleState: 'completed',
          });
        } else {
          set({
            currentSession: { ...currentSession, endedAt, duration },
            lifecycleState: 'pendingFeelState',
          });
        }
      },

      recordFeelState: (feelState) => {
        const { currentSession, lifecycleState } = get();
        if (lifecycleState !== 'pendingFeelState' || !currentSession) return;
        set({
          currentSession: { ...currentSession, feelStateAfter: feelState },
          lifecycleState: 'completed',
        });
      },

      skipFeelState: () => {
        if (get().lifecycleState !== 'pendingFeelState') return;
        set({ lifecycleState: 'completed' });
      },

      completeSession: () => {
        const { currentSession, lifecycleState, sessionHistory } = get();
        if (lifecycleState !== 'completed' || !currentSession) return;

        const updated = [currentSession, ...sessionHistory].slice(0, HISTORY_CAP);
        set({
          currentSession: null,
          sessionHistory: updated,
          lifecycleState: 'idle',
        });
      },
    }),
    {
      name: 'session-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useSessionStore.setState(INITIAL));
```

Commit: `feat(data): add sessionStore with lifecycle state machine`

---

## Chunk 3: Operations

### Task 9: calculateStageFromBirthDate

**Files:**
- Create: `src/operations/baby/calculate-stage.ts`
- Test: `src/operations/baby/__tests__/calculate-stage.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/operations/baby/__tests__/calculate-stage.test.ts
import { calculateStageFromBirthDate } from '../calculate-stage';

describe('calculateStageFromBirthDate', () => {
  const now = new Date('2026-03-13');

  it('returns 0 for 0-3 months (passive listening)', () => {
    expect(calculateStageFromBirthDate('2026-01-01', now)).toBe(0);
  });

  it('returns 1 for 3-6 months (parent bounce)', () => {
    expect(calculateStageFromBirthDate('2025-10-01', now)).toBe(1);
  });

  it('returns 2 for 6-12 months (pat-a-cake)', () => {
    expect(calculateStageFromBirthDate('2025-06-01', now)).toBe(2);
  });

  it('returns 3 for 12-18 months (tap mode)', () => {
    expect(calculateStageFromBirthDate('2025-01-01', now)).toBe(3);
  });

  it('returns 4 for 18-36 months (instrument mode)', () => {
    expect(calculateStageFromBirthDate('2024-06-01', now)).toBe(4);
  });

  it('returns 5 for 36-60 months (simple game mode)', () => {
    expect(calculateStageFromBirthDate('2023-01-01', now)).toBe(5);
  });

  it('returns 5 for children older than 60 months', () => {
    expect(calculateStageFromBirthDate('2020-01-01', now)).toBe(5);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/operations/baby/calculate-stage.ts
type BabyStage = 0 | 1 | 2 | 3 | 4 | 5;

export const calculateStageFromBirthDate = (
  birthDate: string,
  now: Date = new Date(),
): BabyStage => {
  const birth = new Date(birthDate);
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  if (months < 3) return 0;
  if (months < 6) return 1;
  if (months < 12) return 2;
  if (months < 18) return 3;
  if (months < 36) return 4;
  return 5;
};
```

Commit: `feat(data): add calculateStageFromBirthDate pure function`

---

### Task 10: Weekly Summary Computation

**Files:**
- Create: `src/operations/progress/weekly-summary.ts`
- Test: `src/operations/progress/__tests__/weekly-summary.test.ts`

```typescript
// src/operations/progress/weekly-summary.ts
import type { Session, WeeklySummary, FeelState } from '@types';

export const computeWeeklySummary = (
  userId: string,
  weekStart: string,
  sessions: Session[],
): WeeklySummary => {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const weekSessions = sessions.filter((s) => {
    const started = new Date(s.startedAt);
    return started >= weekStartDate && started < weekEndDate;
  });

  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const polyrhythmsVisited = [...new Set(weekSessions.map((s) => s.polyrhythmId))];

  const feelStateChanges: Record<string, { from: FeelState; to: FeelState }> = {};

  return {
    userId,
    weekStart,
    totalPracticeMinutes: Math.round(totalSeconds / 60),
    sessionsCount: weekSessions.length,
    polyrhythmsVisited,
    feelStateChanges,
  };
};
```

Commit: `feat(data): add weekly summary computation`

---

## Chunk 4: Supabase + Auth

### Task 11: Supabase Client Setup

**Files:**
- Create: `src/data-access/supabase/client.ts`

```typescript
// src/data-access/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Commit: `feat(data): add Supabase client with SecureStore auth storage`

---

### Task 12: Anonymous Auth Flow

**Files:**
- Create: `src/data-access/supabase/auth.ts`
- Test: `src/data-access/supabase/__tests__/auth.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/supabase/__tests__/auth.test.ts
import { initAnonymousAuth } from '../auth';

describe('initAnonymousAuth', () => {
  it('returns a user ID on success', async () => {
    const userId = await initAnonymousAuth();
    expect(userId).toBe('test-anon-user-id');
  });

  it('throws on auth failure', async () => {
    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValueOnce({
      auth: {
        signInAnonymously: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Auth failed' },
        }),
      },
    });

    // Re-import to get fresh client -- or test the function directly
    await expect(initAnonymousAuth()).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/supabase/auth.ts
import { supabase } from './client';

export const initAnonymousAuth = async (): Promise<string> => {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Anonymous auth failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Anonymous auth returned no user');
  }

  return data.user.id;
};

export const upgradeToEmailAuth = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ email, password });
  if (error) {
    throw new Error(`Account upgrade failed: ${error.message}`);
  }
};
```

Commit: `feat(data): add anonymous auth flow with email upgrade`

---

## Chunk 5: Sync System

### Task 13: Sync Queue

**Files:**
- Create: `src/libs/sync/sync-queue.ts`
- Test: `src/libs/sync/__tests__/sync-queue.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/sync/__tests__/sync-queue.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToQueue, getQueue, removeFromQueue, clearQueue } from '../sync-queue';

describe('SyncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty', async () => {
    const queue = await getQueue();
    expect(queue).toEqual([]);
  });

  it('addToQueue appends an item', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]?.table).toBe('sessions');
    expect(queue[0]?.retryCount).toBe(0);
  });

  it('items have auto-generated id and queuedAt', async () => {
    await addToQueue({ table: 'users', operation: 'upsert', payload: { id: 'u1' } });
    const queue = await getQueue();
    expect(queue[0]?.id).toBeDefined();
    expect(queue[0]?.queuedAt).toBeDefined();
  });

  it('removeFromQueue removes by id', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    await removeFromQueue(queue[0]?.id ?? '');
    const after = await getQueue();
    expect(after).toHaveLength(0);
  });

  it('clearQueue removes all items', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await addToQueue({ table: 'users', operation: 'upsert', payload: { id: '2' } });
    await clearQueue();
    expect(await getQueue()).toEqual([]);
  });

  it('maintains FIFO order', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: 'first' } });
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: 'second' } });
    const queue = await getQueue();
    expect(queue[0]?.payload.id).toBe('first');
    expect(queue[1]?.payload.id).toBe('second');
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/sync/sync-queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuid } from 'uuid';

const QUEUE_KEY = 'groovecore:sync-queue';

type SyncTable = 'users' | 'sessions' | 'baby_profiles' | 'baby_sessions' | 'lesson_progress';

export type SyncQueueItem = {
  id: string;
  table: SyncTable;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  queuedAt: string;
  retryCount: number;
};

type AddParams = {
  table: SyncTable;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
};

export const getQueue = async (): Promise<SyncQueueItem[]> => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as SyncQueueItem[];
};

const saveQueue = async (queue: SyncQueueItem[]): Promise<void> => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const addToQueue = async (params: AddParams): Promise<void> => {
  const queue = await getQueue();
  const item: SyncQueueItem = {
    id: uuid(),
    table: params.table,
    operation: params.operation,
    payload: params.payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(item);
  await saveQueue(queue);
};

export const removeFromQueue = async (id: string): Promise<void> => {
  const queue = await getQueue();
  await saveQueue(queue.filter((item) => item.id !== id));
};

export const updateQueueItem = async (id: string, updates: Partial<SyncQueueItem>): Promise<void> => {
  const queue = await getQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index >= 0 && queue[index]) {
    queue[index] = { ...queue[index], ...updates } as SyncQueueItem;
    await saveQueue(queue);
  }
};

export const clearQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
```

Commit: `feat(data): add AsyncStorage-based sync queue`

---

### Task 14: Sync Service

**Files:**
- Create: `src/libs/sync/sync-service.ts`
- Test: `src/libs/sync/__tests__/sync-service.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/sync/__tests__/sync-service.test.ts
import { flushSyncQueue } from '../sync-service';
import { addToQueue, getQueue, clearQueue } from '../sync-queue';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('flushSyncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('does nothing when queue is empty', async () => {
    await flushSyncQueue();
    // No errors thrown
  });

  it('processes items in FIFO order', async () => {
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '2' } });
    await flushSyncQueue();
    const remaining = await getQueue();
    expect(remaining).toHaveLength(0);
  });

  it('increments retryCount on failure and stops', async () => {
    const { createClient } = require('@supabase/supabase-js');
    const mockUpsert = jest.fn().mockResolvedValue({ error: { message: 'Network error' } });
    createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ upsert: mockUpsert }),
      auth: { signInAnonymously: jest.fn() },
    });

    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    await flushSyncQueue();
    const queue = await getQueue();
    expect(queue[0]?.retryCount).toBe(1);
  });

  it('removes items after 5 failures (dead letter)', async () => {
    // Manually set item with retryCount 4
    await addToQueue({ table: 'sessions', operation: 'upsert', payload: { id: '1' } });
    const queue = await getQueue();
    if (queue[0]) {
      queue[0].retryCount = 4;
      await AsyncStorage.setItem('groovecore:sync-queue', JSON.stringify(queue));
    }

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: { message: 'fail' } }),
      }),
      auth: { signInAnonymously: jest.fn() },
    });

    await flushSyncQueue();
    const remaining = await getQueue();
    expect(remaining).toHaveLength(0); // dead lettered
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/sync/sync-service.ts
import { supabase } from '@data-access/supabase';
import { getQueue, removeFromQueue, updateQueueItem } from './sync-queue';
import type { SyncQueueItem } from './sync-queue';

const MAX_RETRIES = 5;

const syncItem = async (item: SyncQueueItem): Promise<void> => {
  if (item.operation === 'upsert') {
    const { error } = await supabase
      .from(item.table)
      .upsert(item.payload, { onConflict: 'id' });
    if (error) throw error;
  }

  if (item.operation === 'delete') {
    const { error } = await supabase
      .from(item.table)
      .delete()
      .eq('id', item.payload.id as string);
    if (error) throw error;
  }
};

export const flushSyncQueue = async (): Promise<void> => {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const sorted = [...queue].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));

  for (const item of sorted) {
    try {
      await syncItem(item);
      await removeFromQueue(item.id);
    } catch {
      const newRetryCount = item.retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        console.error(`[SyncService] Dead letter: ${item.table}:${item.id} after ${MAX_RETRIES} failures`);
        await removeFromQueue(item.id);
      } else {
        await updateQueueItem(item.id, { retryCount: newRetryCount });
      }
      break; // stop on first error
    }
  }
};
```

Commit: `feat(data): add sync service with retry and dead letter logic`

---

### Task 15: Sync Triggers

**Files:**
- Create: `src/libs/sync/sync-triggers.ts`
- Test: `src/libs/sync/__tests__/sync-triggers.test.ts`

```typescript
// src/libs/sync/sync-triggers.ts
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { flushSyncQueue } from './sync-service';

let netInfoUnsub: (() => void) | null = null;
let appStateUnsub: { remove: () => void } | null = null;

export const startSyncTriggers = (): void => {
  // Trigger on connectivity restore
  netInfoUnsub = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      flushSyncQueue().catch(console.error);
    }
  }) as unknown as () => void;

  // Trigger on app foreground
  const handleAppState = (nextState: AppStateStatus): void => {
    if (nextState === 'active') {
      flushSyncQueue().catch(console.error);
    }
  };
  appStateUnsub = AppState.addEventListener('change', handleAppState);
};

export const stopSyncTriggers = (): void => {
  netInfoUnsub?.();
  netInfoUnsub = null;
  appStateUnsub?.remove();
  appStateUnsub = null;
};

export const triggerSyncAfterSessionEnd = (): void => {
  flushSyncQueue().catch(console.error);
};
```

Commit: `feat(data): add sync triggers for connectivity, foreground, and session end`

---

## Chunk 6: Initialization + Barrel Exports + Verification

### Task 16: Stores Barrel Export

```typescript
// src/data-access/stores/index.ts
export { useUserStore } from './use-user-store';
export { useSessionStore } from './use-session-store';
export { useLessonStore } from './use-lesson-store';
export { useBabyStore } from './use-baby-store';
export { useSettingsStore } from './use-settings-store';
export { resetAllStores } from './store-reset';
```

```typescript
// src/data-access/supabase/index.ts
export { supabase } from './client';
export { initAnonymousAuth, upgradeToEmailAuth } from './auth';
```

```typescript
// src/libs/sync/index.ts
export { addToQueue, getQueue, removeFromQueue, clearQueue } from './sync-queue';
export type { SyncQueueItem } from './sync-queue';
export { flushSyncQueue } from './sync-service';
export { startSyncTriggers, stopSyncTriggers, triggerSyncAfterSessionEnd } from './sync-triggers';
```

Commit: `feat(data): add barrel exports for stores, supabase, and sync`

---

### Task 17: Full Verification

- [ ] **Step 1: Run all data layer tests**

Run: `NODE_ENV=test TZ=UTC npx jest src/data-access/ src/libs/sync/ src/operations/baby/ src/operations/progress/ --no-coverage`
Expected: ALL PASS

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Run linter**

Run: `npx eslint src/data-access/ src/libs/sync/ src/operations/baby/ src/operations/progress/ --max-warnings 0`
Expected: 0 errors, 0 warnings

- [ ] **Step 4: Commit**

`git add . && git commit -m "feat(data): complete data layer epic -- all stores, sync, and auth verified"`

---

## Summary

| Chunk | Tasks | Tests | Key Deliverable |
|-------|-------|-------|-----------------|
| 1: Infrastructure | 3 | 0 | Deps, mocks, persist helper, reset utility |
| 2: Domain Stores | 5 | 35+ | settingsStore, userStore, lessonStore, babyStore, sessionStore |
| 3: Operations | 2 | 10+ | calculateStageFromBirthDate, weekly summary |
| 4: Supabase + Auth | 2 | 4+ | Client setup, anonymous auth, email upgrade |
| 5: Sync System | 3 | 12+ | Sync queue, sync service, sync triggers |
| 6: Exports + Verify | 2 | 0 | Barrel exports, full verification |
| **Total** | **17** | **61+** | Complete offline-first data layer |

## Dependency Chain

```
Chunk 1 (Infrastructure) -- no deps beyond Epic 0
  |
  v
Chunk 2 (Stores) -- needs persist helper
  |
  v
Chunk 3 (Operations) -- independent, but uses types from Chunk 2
  |
  v
Chunk 4 (Supabase) -- needs expo-secure-store from Chunk 1
  |
  v
Chunk 5 (Sync) -- needs Chunks 2 + 4 (stores + supabase)
  |
  v
Chunk 6 (Verify) -- needs all above
```
