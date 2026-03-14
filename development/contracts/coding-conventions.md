# Coding Conventions

Rules and patterns every agent must follow when writing code for GrooveCore.

---

## File & Folder Naming

- **Files:** `kebab-case.ts` / `kebab-case.tsx`
- **Component files:** `kebab-case.tsx` (e.g., `radial-visualizer.tsx`)
- **Type files:** `types.ts` within each module
- **Store files:** `use-<domain>-store.ts` (e.g., `use-audio-store.ts`)
- **Hook files:** `use-<name>.ts` (e.g., `use-tap-tempo.ts`)
- **Constant files:** `constants.ts` within each module
- **Test files:** `__tests__/<file-name>.test.ts(x)` co-located with source

---

## Project Structure (Expo Router)

```
app/
├── _layout.tsx                    # Root layout (providers, fonts, splash)
├── (tabs)/
│   ├── _layout.tsx                # Tab navigator layout
│   ├── learn/
│   │   ├── index.tsx              # Polyrhythm library grid
│   │   ├── [polyrhythmId]/
│   │   │   ├── index.tsx          # Polyrhythm detail
│   │   │   └── lesson.tsx         # Lesson flow
│   ├── practice/
│   │   ├── index.tsx              # Core player
│   │   └── disappearing-beat.tsx  # Disappearing beat mode
│   ├── baby/
│   │   ├── index.tsx              # Baby mode home
│   │   ├── duet-tap.tsx           # Duet tap screen
│   │   └── visualizer.tsx         # Baby visualizer
│   ├── progress/
│   │   └── index.tsx              # Progress dashboard
│   └── settings/
│       └── index.tsx              # Settings screen
src/
├── components/                    # UI components (no business logic)
│   ├── ui/                        # Generic reusable components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── slider.tsx
│   │   └── pill-selector.tsx
│   ├── audio/                     # Audio-specific components
│   │   ├── radial-visualizer.tsx
│   │   ├── tap-zone.tsx
│   │   └── volume-slider.tsx
│   └── baby/                      # Baby-mode-specific components
│       ├── activity-card.tsx
│       ├── baby-visualizer-canvas.tsx
│       └── duet-tap-zone.tsx
├── stores/                        # All Zustand stores (foundation + feature)
│   ├── use-audio-store.ts         # CANONICAL audio store location
│   ├── use-user-store.ts
│   ├── use-session-store.ts
│   ├── use-lesson-store.ts
│   ├── use-baby-store.ts
│   └── use-settings-store.ts
├── lib/
│   ├── audio/                     # Audio engine internals (NOT stores)
│   │   ├── scheduler.ts           # Polyrhythm hit calculation
│   │   ├── sound-pool.ts          # Sound preloading & pooling
│   │   └── tap-tempo.ts           # Tap tempo algorithm
│   ├── supabase/
│   │   ├── client.ts              # Supabase client setup
│   │   ├── sync.ts                # Background sync service
│   │   └── schema.ts              # Type-safe table helpers
│   └── utils/
│       ├── math.ts                # LCM, GCD, timing calc
│       └── format.ts              # Duration, BPM formatting
├── hooks/
│   ├── use-keep-awake.ts
│   ├── use-beat-callback.ts
│   └── use-baby-stage.ts
├── types/
│   └── index.ts                   # All shared TypeScript types (mirrors data-models.md)
├── constants/
│   ├── tokens.ts                  # Design tokens as JS constants
│   ├── sounds.ts                  # Sound file registry
│   ├── polyrhythms.ts             # Available polyrhythm definitions
│   └── lessons/
│       └── three-two.ts           # 3:2 lesson step data
├── assets/
│   ├── sounds/                    # .wav files
│   └── images/                    # Icons, illustrations
```

**Store location note:** Foundation stores (audio, data) live in `src/stores/` alongside feature stores. The `src/lib/` directory contains engine internals (scheduler, sound-loader, etc.) but NOT the Zustand stores.

---

## Canonical Types

All TypeScript types are defined in `development/contracts/data-models.md` and implemented in `src/types/index.ts`. Do NOT define types in feature specs, task files, or other contract documents.

---

## Component Pattern

```tsx
// kebab-case file name: radial-visualizer.tsx

import { StyleSheet, View } from 'react-native';

// Props interface — always typed, always exported
export interface RadialVisualizerProps {
  ratioA: number;
  ratioB: number;
  currentBeatA: number;
  currentBeatB: number;
  isPlaying: boolean;
}

// Functional component — always named export (not default)
export function RadialVisualizer({
  ratioA,
  ratioB,
  currentBeatA,
  currentBeatB,
  isPlaying,
}: RadialVisualizerProps) {
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

// Co-located styles at bottom of file
const styles = StyleSheet.create({
  container: {
    // ...
  },
});
```

**Rules:**
- Named exports only — no `export default`
- Props interface always exported (for testing, composition)
- `StyleSheet.create` at bottom of file, not inline styles
- No business logic in components — delegate to stores and hooks

---

## State Pattern (Zustand)

```tsx
// use-audio-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioState {
  // State
  isPlaying: boolean;
  bpm: number;
  ratioA: number;
  ratioB: number;

  // Actions
  play: () => void;
  pause: () => void;
  setBpm: (bpm: number) => void;
  setRatio: (a: number, b: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      bpm: 100,
      ratioA: 3,
      ratioB: 2,

      // Actions
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      // Use BPM_MIN and BPM_MAX from @/constants/audio instead of magic numbers
      setBpm: (bpm) => set({ bpm: clamp(bpm, BPM_MIN, BPM_MAX) }),
      setRatio: (a, b) => {
        get().pause();
        set({ ratioA: a, ratioB: b });
      },
    }),
    {
      name: 'audio-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bpm: state.bpm,
        ratioA: state.ratioA,
        ratioB: state.ratioB,
      }),
    }
  )
);

// Selectors — exported separately for memoization
export const selectIsPlaying = (state: AudioState) => state.isPlaying;
export const selectBpm = (state: AudioState) => state.bpm;
export const selectRatio = (state: AudioState) => ({
  a: state.ratioA,
  b: state.ratioB,
});
```

**Rules:**
- One store per domain (`use-audio-store.ts`, `use-user-store.ts`, etc.)
- State and actions in the same store
- Persist middleware with AsyncStorage for offline-first
- `partialize` to control what gets persisted (never persist `isPlaying`, transient UI state)
- Selectors exported as standalone functions
- Components use selectors: `const bpm = useAudioStore(selectBpm)`

---

## Audio Pattern

**All audio interaction goes through `useAudioStore` actions. No component should import from `src/lib/audio/` directly.**

```tsx
// ✅ Correct
const play = useAudioStore((s) => s.play);
play();

// ❌ Wrong — bypasses the store
import { scheduler } from '@/lib/audio/scheduler';
scheduler.start();
```

The store internally uses `src/lib/audio/` modules. This boundary keeps audio logic testable and replaceable.

---

## Import Ordering

Imports should be grouped in this order, separated by blank lines:

```tsx
// 1. React / React Native
import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

// 2. Expo
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

// 3. Third-party
import { Canvas } from '@shopify/react-native-skia';
import Animated from 'react-native-reanimated';

// 4. Local (absolute paths with @/ alias)
import { useAudioStore, selectBpm } from '@/stores/use-audio-store';
import { RadialVisualizer } from '@/components/audio/radial-visualizer';
import { tokens } from '@/constants/tokens';
import type { PolyrhythmRatio } from '@/types';
```

**Path alias:** Use `@/` mapped to `src/` in `tsconfig.json`.

---

## Testing

- **Framework:** Jest + React Native Testing Library
- **Location:** `__tests__/` folder co-located with source file
- **Naming:** `<file-name>.test.ts(x)`
- **What to test:**
  - Pure functions (scheduler, tap tempo, math utils) — unit tests
  - Store actions — verify state transitions
  - Components — render + interaction tests for user-facing behavior
  - Do NOT test: styling, internal implementation details

```tsx
// __tests__/scheduler.test.ts
import { calculateHits } from '../scheduler';

describe('calculateHits', () => {
  it('generates correct hit times for 3:2 at 120 BPM', () => {
    const hits = calculateHits(3, 2, 120);
    expect(hits).toHaveLength(5); // 3 + 2 hits per cycle
    expect(hits[0].time).toBe(0);
    expect(hits[0].layer).toBe('A');
  });
});
```

---

## Error Handling

- **ErrorBoundary** at tab level — each tab wrapped in error boundary that shows fallback UI
- **Async actions:** try-catch in store actions, set error state, never throw to component
- **Audio errors:** fail silently with console.warn — audio issues should not crash the app
- **Network errors:** queue for retry (offline-first), show subtle toast if sync fails

```tsx
// In store action
startSession: async () => {
  try {
    set({ isLoading: true, error: null });
    // ... action logic
  } catch (error) {
    set({ error: 'Failed to start session' });
    console.warn('startSession error:', error);
  } finally {
    set({ isLoading: false });
  }
},
```

---

## Naming Conventions Summary

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `radial-visualizer.tsx` |
| Components | PascalCase | `RadialVisualizer` |
| Hooks | camelCase with `use` prefix | `useTapTempo` |
| Stores | camelCase with `use` prefix | `useAudioStore` |
| Constants | UPPER_SNAKE_CASE | `MAX_BPM` |
| Types/Interfaces | PascalCase | `AudioConfig` |
| Enums | PascalCase (type + values) | `FeelState`, `'executing'` |
| Store actions | camelCase verbs | `play`, `setBpm`, `fadeLayer` |
| Selectors | camelCase with `select` prefix | `selectIsPlaying` |
| Test files | `<source>.test.ts(x)` | `scheduler.test.ts` |
