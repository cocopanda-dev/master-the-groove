# Epic 1: Audio Engine -- Implementation Plan

> **Epic numbering updated 2026-03-13.** This was formerly Epic 2. Now Epic 1 per unified numbering scheme.

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete audio engine foundation -- polyrhythm scheduler, sound system, transport controls, and Zustand store -- so every feature that produces sound or reacts to beats can consume it.

**Architecture:** Pure math layer (`src/operations/polyrhythm/`) computes schedules with zero side effects. Sound system (`src/libs/audio/`) manages expo-av playback, pooling, and volume. Transport engine runs a wall-clock-anchored setTimeout loop. The `audioStore` (Zustand, ephemeral) is the only public API -- features never import internals.

**Tech Stack:** expo-av, Zustand 5.x, TypeScript strict mode, Jest with fake timers.

---

## File Map

### Files to Create

```
src/
  operations/
    polyrhythm/
      math-utils.ts
      generate-schedule.ts
      tap-tempo.ts
      __tests__/
        math-utils.test.ts
        generate-schedule.test.ts
        tap-tempo.test.ts
      index.ts
  libs/
    audio/
      sound-loader.ts
      sound-pool.ts
      volume-utils.ts
      scheduling-loop.ts
      transport.ts
      fade-engine.ts
      stereo.ts
      __tests__/
        sound-loader.test.ts
        sound-pool.test.ts
        volume-utils.test.ts
        scheduling-loop.test.ts
        transport.test.ts
        fade-engine.test.ts
        stereo.test.ts
      index.ts
  data-access/
    stores/
      use-audio-store.ts
      __tests__/
        use-audio-store.test.ts
  types/
    audio-engine.ts  (internal types: ScheduleEvent, FadeState, SoundPool, etc.)
```

### Files to Modify

```
package.json          (add expo-av)
src/__tests__/mocks/  (add expo-av mock)
```

---

## Dependencies to Install

```bash
npx expo install expo-av
```

---

## Chunk 1: Pure Math (no audio deps)

### Task 1: GCD/LCM Utilities

**Files:**
- Create: `src/operations/polyrhythm/math-utils.ts`
- Test: `src/operations/polyrhythm/__tests__/math-utils.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/operations/polyrhythm/__tests__/math-utils.test.ts
import { gcd, lcm } from '../math-utils';

describe('gcd', () => {
  it('computes gcd of 3 and 2', () => {
    expect(gcd(3, 2)).toBe(1);
  });

  it('computes gcd of 4 and 6', () => {
    expect(gcd(4, 6)).toBe(2);
  });

  it('computes gcd of 12 and 8', () => {
    expect(gcd(12, 8)).toBe(4);
  });

  it('handles equal values', () => {
    expect(gcd(5, 5)).toBe(5);
  });

  it('handles 1', () => {
    expect(gcd(1, 7)).toBe(1);
  });
});

describe('lcm', () => {
  it('computes lcm of 3 and 2', () => {
    expect(lcm(3, 2)).toBe(6);
  });

  it('computes lcm of 4 and 3', () => {
    expect(lcm(4, 3)).toBe(12);
  });

  it('computes lcm of 2 and 3', () => {
    expect(lcm(2, 3)).toBe(6);
  });

  it('computes lcm of 5 and 4', () => {
    expect(lcm(5, 4)).toBe(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/math-utils.test.ts --no-coverage`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/operations/polyrhythm/math-utils.ts

export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
};

export const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/math-utils.test.ts --no-coverage`
Expected: PASS (9 tests passed)

- [ ] **Step 5: Commit**

`git add src/operations/polyrhythm/math-utils.ts src/operations/polyrhythm/__tests__/math-utils.test.ts && git commit -m "feat(audio): add GCD/LCM math utilities"`

---

### Task 2: Polyrhythm Schedule Generator

**Files:**
- Create: `src/operations/polyrhythm/generate-schedule.ts`
- Test: `src/operations/polyrhythm/__tests__/generate-schedule.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/operations/polyrhythm/__tests__/generate-schedule.test.ts
import { generatePolyrhythmSchedule } from '../generate-schedule';
import type { ScheduleEvent } from '../generate-schedule';

describe('generatePolyrhythmSchedule', () => {
  describe('3:2 at 120 BPM', () => {
    // LCM(3,2) = 6, cycleDuration = (6/120)*60000 = 3000ms
    const result = generatePolyrhythmSchedule(3, 2, 120);

    it('returns correct cycle duration', () => {
      expect(result.cycleDurationMs).toBe(3000);
    });

    it('returns correct LCM', () => {
      expect(result.lcm).toBe(6);
    });

    it('generates 5 events (3 A + 2 B)', () => {
      expect(result.events).toHaveLength(5);
    });

    it('has Layer A events at 0, 1000, 2000 ms', () => {
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => e.time)).toEqual([0, 1000, 2000]);
    });

    it('has Layer B events at 0, 1500 ms', () => {
      const layerB = result.events.filter((e) => e.layer === 'B');
      expect(layerB.map((e) => e.time)).toEqual([0, 1500]);
    });

    it('events are sorted by time', () => {
      const times = result.events.map((e) => e.time);
      const sorted = [...times].sort((a, b) => a - b);
      expect(times).toEqual(sorted);
    });

    it('coincident beats (beat 1) both appear at time 0', () => {
      const atZero = result.events.filter((e) => e.time === 0);
      expect(atZero).toHaveLength(2);
      expect(atZero.map((e) => e.layer).sort()).toEqual(['A', 'B']);
    });
  });

  describe('4:3 at 90 BPM', () => {
    // LCM(4,3) = 12, cycleDuration = (12/90)*60000 = 8000ms
    const result = generatePolyrhythmSchedule(4, 3, 90);

    it('returns correct cycle duration', () => {
      expect(result.cycleDurationMs).toBeCloseTo(8000, 1);
    });

    it('generates 7 events (4 A + 3 B)', () => {
      expect(result.events).toHaveLength(7);
    });

    it('has correct Layer A intervals (every 2000ms)', () => {
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => Math.round(e.time))).toEqual([0, 2000, 4000, 6000]);
    });

    it('has correct Layer B intervals (every 2666.67ms)', () => {
      const layerB = result.events.filter((e) => e.layer === 'B');
      expect(layerB[0]?.time).toBeCloseTo(0, 1);
      expect(layerB[1]?.time).toBeCloseTo(2666.67, 0);
      expect(layerB[2]?.time).toBeCloseTo(5333.33, 0);
    });
  });

  describe('2:3 (reverse) at 120 BPM', () => {
    // LCM(2,3) = 6, cycleDuration = (6/120)*60000 = 3000ms
    const result = generatePolyrhythmSchedule(2, 3, 120);

    it('Layer A has 2 hits, Layer B has 3 hits', () => {
      expect(result.events.filter((e) => e.layer === 'A')).toHaveLength(2);
      expect(result.events.filter((e) => e.layer === 'B')).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('validates BPM range (rejects < 20)', () => {
      expect(() => generatePolyrhythmSchedule(3, 2, 10)).toThrow();
    });

    it('validates BPM range (rejects > 240)', () => {
      expect(() => generatePolyrhythmSchedule(3, 2, 300)).toThrow();
    });

    it('validates ratio (rejects 0)', () => {
      expect(() => generatePolyrhythmSchedule(0, 2, 120)).toThrow();
    });

    it('beatIndex is 0-indexed within each layer', () => {
      const result = generatePolyrhythmSchedule(3, 2, 120);
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => e.beatIndex)).toEqual([0, 1, 2]);
    });
  });
});
```

- [ ] **Step 2: Run test**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/generate-schedule.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/operations/polyrhythm/generate-schedule.ts
import { lcm } from './math-utils';

export type ScheduleEvent = {
  time: number;
  layer: 'A' | 'B';
  beatIndex: number;
};

export type PolyrhythmSchedule = {
  events: ScheduleEvent[];
  cycleDurationMs: number;
  lcm: number;
};

export const generatePolyrhythmSchedule = (
  ratioA: number,
  ratioB: number,
  bpm: number,
): PolyrhythmSchedule => {
  if (ratioA <= 0 || ratioB <= 0) {
    throw new Error(`Invalid ratio: ${ratioA}:${ratioB}. Both must be positive integers.`);
  }
  if (bpm < 20 || bpm > 240) {
    throw new Error(`Invalid BPM: ${bpm}. Must be between 20 and 240.`);
  }

  const cycleLength = lcm(ratioA, ratioB);
  const cycleDurationMs = (cycleLength / bpm) * 60000;
  const intervalA = cycleDurationMs / ratioA;
  const intervalB = cycleDurationMs / ratioB;

  const events: ScheduleEvent[] = [];

  for (let i = 0; i < ratioA; i++) {
    events.push({ time: i * intervalA, layer: 'A', beatIndex: i });
  }

  for (let i = 0; i < ratioB; i++) {
    events.push({ time: i * intervalB, layer: 'B', beatIndex: i });
  }

  events.sort((a, b) => a.time - b.time || (a.layer === 'A' ? -1 : 1));

  return { events, cycleDurationMs, lcm: cycleLength };
};
```

- [ ] **Step 4: Run test**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/generate-schedule.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

`git add src/operations/polyrhythm/generate-schedule.ts src/operations/polyrhythm/__tests__/generate-schedule.test.ts && git commit -m "feat(audio): add polyrhythm schedule generator"`

---

### Task 3: Tap Tempo Algorithm

**Files:**
- Create: `src/operations/polyrhythm/tap-tempo.ts`
- Test: `src/operations/polyrhythm/__tests__/tap-tempo.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/operations/polyrhythm/__tests__/tap-tempo.test.ts
import { createTapTempo } from '../tap-tempo';

describe('createTapTempo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null on first tap (not enough data)', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(1000));
    expect(tapTempo.tap()).toBeNull();
  });

  it('computes BPM from 2 taps', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500)); // 500ms interval = 120 BPM
    expect(tapTempo.tap()).toBe(120);
  });

  it('averages intervals from 4 taps', () => {
    const tapTempo = createTapTempo();
    // 4 taps at 600ms intervals = 100 BPM
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(600));
    tapTempo.tap();
    jest.setSystemTime(new Date(1200));
    tapTempo.tap();
    jest.setSystemTime(new Date(1800));
    expect(tapTempo.tap()).toBe(100);
  });

  it('keeps only last 4 timestamps (circular buffer)', () => {
    const tapTempo = createTapTempo();
    // 5 taps, should use last 4
    [0, 500, 1000, 1500, 2000].forEach((t) => {
      jest.setSystemTime(new Date(t));
      tapTempo.tap();
    });
    // Last 4 intervals: 500, 500, 500 -> avg 500ms = 120 BPM
    expect(tapTempo.tap()).not.toBeNull();
  });

  it('resets buffer after 2 second gap', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500));
    tapTempo.tap();
    // 2+ second gap
    jest.setSystemTime(new Date(3000));
    expect(tapTempo.tap()).toBeNull(); // buffer reset, first tap
  });

  it('clamps BPM to 20-240 range', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(100)); // 100ms = 600 BPM -> clamped to 240
    expect(tapTempo.tap()).toBe(240);
  });

  it('reset() clears the buffer', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500));
    tapTempo.tap();
    tapTempo.reset();
    jest.setSystemTime(new Date(1000));
    expect(tapTempo.tap()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/tap-tempo.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/operations/polyrhythm/tap-tempo.ts

const MIN_BPM = 20;
const MAX_BPM = 240;
const BUFFER_SIZE = 4;
const RESET_THRESHOLD_MS = 2000;

type TapTempo = {
  tap: () => number | null;
  reset: () => void;
};

export const createTapTempo = (): TapTempo => {
  const timestamps: number[] = [];

  const reset = (): void => {
    timestamps.length = 0;
  };

  const tap = (): number | null => {
    const now = Date.now();

    // Reset if gap exceeds threshold
    const lastTimestamp = timestamps[timestamps.length - 1];
    if (lastTimestamp !== undefined && now - lastTimestamp > RESET_THRESHOLD_MS) {
      reset();
    }

    timestamps.push(now);

    // Keep only last BUFFER_SIZE timestamps
    if (timestamps.length > BUFFER_SIZE) {
      timestamps.splice(0, timestamps.length - BUFFER_SIZE);
    }

    // Need at least 2 timestamps to compute interval
    if (timestamps.length < 2) {
      return null;
    }

    // Compute average interval
    let totalInterval = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalInterval += (timestamps[i] ?? 0) - (timestamps[i - 1] ?? 0);
    }
    const avgInterval = totalInterval / (timestamps.length - 1);

    // Convert to BPM and clamp
    const bpm = Math.round(60000 / avgInterval);
    return Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
  };

  return { tap, reset };
};
```

- [ ] **Step 4: Run test**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/__tests__/tap-tempo.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

`git add src/operations/polyrhythm/tap-tempo.ts src/operations/polyrhythm/__tests__/tap-tempo.test.ts && git commit -m "feat(audio): add tap tempo algorithm with circular buffer"`

---

### Task 3b: Operations barrel export

- [ ] **Step 1: Create barrel**

```typescript
// src/operations/polyrhythm/index.ts
export { gcd, lcm } from './math-utils';
export { generatePolyrhythmSchedule } from './generate-schedule';
export type { ScheduleEvent, PolyrhythmSchedule } from './generate-schedule';
export { createTapTempo } from './tap-tempo';
```

- [ ] **Step 2: Commit**

`git add src/operations/polyrhythm/index.ts && git commit -m "feat(audio): add polyrhythm operations barrel export"`

---

## Chunk 2: Sound System

### Task 4: Install expo-av + Create Jest Mock

- [ ] **Step 1: Install expo-av**

Run: `npx expo install expo-av`

- [ ] **Step 2: Create expo-av Jest mock**

```typescript
// src/__tests__/mocks/expo-av.ts
const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  pauseAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  setStatusAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: { ...mockSound },
        status: { isLoaded: true },
      }),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

export { mockSound };
```

- [ ] **Step 3: Add to jest setup** (if not auto-loaded)

Add `import './mocks/expo-av';` to `src/__tests__/jestSetup.ts`.

- [ ] **Step 4: Commit**

`git add package.json src/__tests__/mocks/expo-av.ts && git commit -m "feat(audio): install expo-av and add jest mock"`

---

### Task 5: Sound Loader

**Files:**
- Create: `src/libs/audio/sound-loader.ts`
- Test: `src/libs/audio/__tests__/sound-loader.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/sound-loader.test.ts
import { Audio } from 'expo-av';
import { preloadSounds, playSound, unloadSounds, isSoundLoaded } from '../sound-loader';

describe('SoundLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preloadSounds', () => {
    it('calls Audio.Sound.createAsync for each MVP sound', async () => {
      await preloadSounds();
      // 3 MVP sounds x 4 pool size = 12 calls
      expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(12);
    });

    it('sets audio mode for background playback', async () => {
      await preloadSounds();
      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        }),
      );
    });
  });

  describe('isSoundLoaded', () => {
    it('returns true for loaded sounds', async () => {
      await preloadSounds();
      expect(isSoundLoaded('click')).toBe(true);
      expect(isSoundLoaded('clave')).toBe(true);
      expect(isSoundLoaded('woodblock')).toBe(true);
    });

    it('returns false for unloaded sounds', () => {
      expect(isSoundLoaded('djembe')).toBe(false);
    });
  });

  describe('unloadSounds', () => {
    it('unloads all sound instances', async () => {
      await preloadSounds();
      await unloadSounds();
      expect(isSoundLoaded('click')).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run test** -- Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/sound-loader.ts
import { Audio } from 'expo-av';
import type { SoundId } from '@types';

const POOL_SIZE = 4;

type SoundPool = {
  instances: Audio.Sound[];
  nextIndex: number;
};

const soundPools: Partial<Record<SoundId, SoundPool>> = {};

const SOUND_FILES: Partial<Record<SoundId, number>> = {
  click: require('../../../assets/sounds/click.wav'),
  clave: require('../../../assets/sounds/clave.wav'),
  woodblock: require('../../../assets/sounds/woodblock.wav'),
};

const MVP_SOUNDS: SoundId[] = ['click', 'clave', 'woodblock'];

export const preloadSounds = async (): Promise<void> => {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });

  for (const name of MVP_SOUNDS) {
    const source = SOUND_FILES[name];
    if (!source) continue;

    const instances: Audio.Sound[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      instances.push(sound);
    }
    soundPools[name] = { instances, nextIndex: 0 };
  }
};

export const playSound = async (
  name: SoundId,
  volume: number,
  pan: number,
): Promise<void> => {
  const pool = soundPools[name];
  if (!pool) return;

  const instance = pool.instances[pool.nextIndex % POOL_SIZE];
  if (!instance) return;

  pool.nextIndex = (pool.nextIndex + 1) % POOL_SIZE;

  await instance.setStatusAsync({
    shouldPlay: true,
    positionMillis: 0,
    volume: Math.max(0, Math.min(1, volume)),
    pan: Math.max(-1, Math.min(1, pan)),
  });
};

export const unloadSounds = async (): Promise<void> => {
  for (const name of MVP_SOUNDS) {
    const pool = soundPools[name];
    if (!pool) continue;
    for (const instance of pool.instances) {
      await instance.unloadAsync();
    }
    delete soundPools[name];
  }
};

export const isSoundLoaded = (name: SoundId): boolean => {
  const pool = soundPools[name];
  return pool !== undefined && pool.instances.length > 0;
};
```

- [ ] **Step 4: Run test** -- Expected: PASS
- [ ] **Step 5: Commit**

`git add src/libs/audio/sound-loader.ts src/libs/audio/__tests__/sound-loader.test.ts && git commit -m "feat(audio): add sound loader with pool preloading"`

---

### Task 6: Volume Utilities

**Files:**
- Create: `src/libs/audio/volume-utils.ts`
- Test: `src/libs/audio/__tests__/volume-utils.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/volume-utils.test.ts
import { computeFinalVolume, clampVolume } from '../volume-utils';

describe('computeFinalVolume', () => {
  it('multiplies layer volume by master volume', () => {
    expect(computeFinalVolume(0.8, 1.0)).toBeCloseTo(0.8);
    expect(computeFinalVolume(0.5, 0.5)).toBeCloseTo(0.25);
  });

  it('clamps to [0, 1]', () => {
    expect(computeFinalVolume(1.5, 1.0)).toBe(1.0);
    expect(computeFinalVolume(-0.5, 1.0)).toBe(0.0);
  });
});

describe('clampVolume', () => {
  it('clamps values to [0, 1]', () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(1.5)).toBe(1.0);
    expect(clampVolume(-0.2)).toBe(0.0);
  });
});
```

- [ ] **Step 2-5: Standard TDD cycle**

```typescript
// src/libs/audio/volume-utils.ts
export const clampVolume = (vol: number): number => Math.max(0, Math.min(1, vol));

export const computeFinalVolume = (layerVol: number, masterVol: number): number =>
  clampVolume(layerVol * masterVol);
```

Commit: `feat(audio): add volume computation utilities`

---

## Chunk 3: Transport Engine

### Task 7: Beat Callback System

**Files:**
- Create: `src/libs/audio/callbacks.ts`
- Test: `src/libs/audio/__tests__/callbacks.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/callbacks.test.ts
import { createCallbackRegistry } from '../callbacks';

describe('CallbackRegistry', () => {
  it('registers and fires callbacks', () => {
    const registry = createCallbackRegistry<[string, number]>();
    const handler = jest.fn();
    registry.subscribe(handler);
    registry.fire('A', 0);
    expect(handler).toHaveBeenCalledWith('A', 0);
  });

  it('returns unsubscribe function', () => {
    const registry = createCallbackRegistry<[string]>();
    const handler = jest.fn();
    const unsub = registry.subscribe(handler);
    unsub();
    registry.fire('A');
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers', () => {
    const registry = createCallbackRegistry<[number]>();
    const h1 = jest.fn();
    const h2 = jest.fn();
    registry.subscribe(h1);
    registry.subscribe(h2);
    registry.fire(42);
    expect(h1).toHaveBeenCalledWith(42);
    expect(h2).toHaveBeenCalledWith(42);
  });

  it('clearAll removes all subscribers', () => {
    const registry = createCallbackRegistry<[number]>();
    const handler = jest.fn();
    registry.subscribe(handler);
    registry.clearAll();
    registry.fire(1);
    expect(handler).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/callbacks.ts
type Callback<TArgs extends unknown[]> = (...args: TArgs) => void;

type CallbackRegistry<TArgs extends unknown[]> = {
  subscribe: (cb: Callback<TArgs>) => () => void;
  fire: (...args: TArgs) => void;
  clearAll: () => void;
};

export const createCallbackRegistry = <TArgs extends unknown[]>(): CallbackRegistry<TArgs> => {
  const callbacks = new Set<Callback<TArgs>>();

  const subscribe = (cb: Callback<TArgs>): (() => void) => {
    callbacks.add(cb);
    return () => {
      callbacks.delete(cb);
    };
  };

  const fire = (...args: TArgs): void => {
    callbacks.forEach((cb) => cb(...args));
  };

  const clearAll = (): void => {
    callbacks.clear();
  };

  return { subscribe, fire, clearAll };
};
```

Commit: `feat(audio): add pub/sub callback registry`

---

### Task 8: Scheduling Loop

**Files:**
- Create: `src/libs/audio/scheduling-loop.ts`
- Test: `src/libs/audio/__tests__/scheduling-loop.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/scheduling-loop.test.ts
import { createSchedulingLoop } from '../scheduling-loop';
import type { ScheduleEvent } from '@operations/polyrhythm';

describe('SchedulingLoop', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const makeEvents = (): ScheduleEvent[] => [
    { time: 0, layer: 'A', beatIndex: 0 },
    { time: 0, layer: 'B', beatIndex: 0 },
    { time: 1000, layer: 'A', beatIndex: 1 },
    { time: 1500, layer: 'B', beatIndex: 1 },
    { time: 2000, layer: 'A', beatIndex: 2 },
  ];

  it('fires onEvent for each scheduled event', () => {
    const onEvent = jest.fn();
    const onCycleEnd = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent,
      onCycleEnd,
    });

    loop.start();
    jest.advanceTimersByTime(3000);

    expect(onEvent).toHaveBeenCalledTimes(5);
    expect(onCycleEnd).toHaveBeenCalledTimes(1);
  });

  it('stop() prevents further events', () => {
    const onEvent = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent,
      onCycleEnd: jest.fn(),
    });

    loop.start();
    jest.advanceTimersByTime(500);
    loop.stop();
    const countAfterStop = onEvent.mock.calls.length;
    jest.advanceTimersByTime(5000);
    expect(onEvent.mock.calls.length).toBe(countAfterStop);
  });

  it('loops continuously until stopped', () => {
    const onCycleEnd = jest.fn();
    const loop = createSchedulingLoop({
      events: makeEvents(),
      cycleDurationMs: 3000,
      onEvent: jest.fn(),
      onCycleEnd,
    });

    loop.start();
    jest.advanceTimersByTime(9000); // 3 full cycles
    loop.stop();
    expect(onCycleEnd).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/scheduling-loop.ts
import type { ScheduleEvent } from '@operations/polyrhythm';

type SchedulingLoopConfig = {
  events: ScheduleEvent[];
  cycleDurationMs: number;
  onEvent: (event: ScheduleEvent) => void;
  onCycleEnd: (cycleCount: number) => void;
};

type SchedulingLoop = {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isRunning: () => boolean;
};

export const createSchedulingLoop = (config: SchedulingLoopConfig): SchedulingLoop => {
  let running = false;
  let cycleCount = 0;
  let cycleStartTime = 0;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let cycleTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = (): void => {
    timers.forEach(clearTimeout);
    timers = [];
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
  };

  const scheduleCycle = (): void => {
    if (!running) return;

    cycleStartTime = Date.now();

    for (const event of config.events) {
      const delay = Math.max(0, event.time);
      const timer = setTimeout(() => {
        if (running) {
          config.onEvent(event);
        }
      }, delay);
      timers.push(timer);
    }

    cycleTimer = setTimeout(() => {
      if (running) {
        cycleCount++;
        config.onCycleEnd(cycleCount);
        clearTimers();
        scheduleCycle();
      }
    }, config.cycleDurationMs);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    cycleCount = 0;
    scheduleCycle();
  };

  const stop = (): void => {
    running = false;
    cycleCount = 0;
    clearTimers();
  };

  const pause = (): void => {
    running = false;
    clearTimers();
  };

  const resume = (): void => {
    if (running) return;
    running = true;
    scheduleCycle();
  };

  const isRunning = (): boolean => running;

  return { start, stop, pause, resume, isRunning };
};
```

Commit: `feat(audio): add wall-clock-anchored scheduling loop`

---

### Task 9: Transport Controls

**Files:**
- Create: `src/libs/audio/transport.ts`
- Test: `src/libs/audio/__tests__/transport.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/transport.test.ts
import { createTransport } from '../transport';

jest.mock('../sound-loader', () => ({
  playSound: jest.fn().mockResolvedValue(undefined),
}));

describe('Transport', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('play() starts playback', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    expect(transport.isPlaying()).toBe(true);
  });

  it('stop() resets state', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(5000);
    transport.stop();
    expect(transport.isPlaying()).toBe(false);
    expect(transport.getCycleCount()).toBe(0);
  });

  it('pause() preserves cycle count', () => {
    const transport = createTransport();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3500); // past 1 cycle (3000ms for 3:2 at 120)
    transport.pause();
    expect(transport.isPlaying()).toBe(false);
    expect(transport.getCycleCount()).toBeGreaterThan(0);
  });

  it('fires onBeat callbacks', () => {
    const transport = createTransport();
    const handler = jest.fn();
    transport.onBeat(handler);
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000); // 1 full cycle = 5 events
    expect(handler).toHaveBeenCalled();
  });

  it('fires onCycleComplete callback', () => {
    const transport = createTransport();
    const handler = jest.fn();
    transport.onCycleComplete(handler);
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it('onBeat returns unsubscribe function', () => {
    const transport = createTransport();
    const handler = jest.fn();
    const unsub = transport.onBeat(handler);
    unsub();
    transport.setRatio(3, 2);
    transport.setBpm(120);
    transport.play();
    jest.advanceTimersByTime(3000);
    expect(handler).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/transport.ts
import { generatePolyrhythmSchedule } from '@operations/polyrhythm';
import { createSchedulingLoop } from './scheduling-loop';
import { playSound } from './sound-loader';
import { computeFinalVolume } from './volume-utils';
import { createCallbackRegistry } from './callbacks';
import type { ScheduleEvent } from '@operations/polyrhythm';
import type { SoundId } from '@types';

type BeatCallback = (layer: 'A' | 'B', beatIndex: number, timestamp: number) => void;
type CycleCallback = (cycleCount: number) => void;

type TransportState = {
  ratioA: number;
  ratioB: number;
  bpm: number;
  soundA: SoundId;
  soundB: SoundId;
  volumeA: number;
  volumeB: number;
  masterVolume: number;
  stereoSplit: boolean;
};

export const createTransport = () => {
  let playing = false;
  let paused = false;
  let cycleCount = 0;
  let loop: ReturnType<typeof createSchedulingLoop> | null = null;
  let beat1Timestamp = 0;

  const state: TransportState = {
    ratioA: 3,
    ratioB: 2,
    bpm: 90,
    soundA: 'click',
    soundB: 'clave',
    volumeA: 0.8,
    volumeB: 0.8,
    masterVolume: 1.0,
    stereoSplit: false,
  };

  const beatCallbacks = createCallbackRegistry<[layer: 'A' | 'B', beatIndex: number, timestamp: number]>();
  const cycleCallbacks = createCallbackRegistry<[cycleCount: number]>();

  const handleEvent = (event: ScheduleEvent): void => {
    const sound = event.layer === 'A' ? state.soundA : state.soundB;
    const layerVol = event.layer === 'A' ? state.volumeA : state.volumeB;
    const finalVol = computeFinalVolume(layerVol, state.masterVolume);
    const pan = state.stereoSplit ? (event.layer === 'A' ? -1 : 1) : 0;

    if (finalVol > 0) {
      playSound(sound, finalVol, pan).catch(() => {});
    }

    beatCallbacks.fire(event.layer, event.beatIndex, Date.now());

    if (event.beatIndex === 0 && event.layer === 'A') {
      beat1Timestamp = Date.now();
    }
  };

  const handleCycleEnd = (count: number): void => {
    cycleCount = count;
    cycleCallbacks.fire(count);
  };

  const play = (): void => {
    if (playing) return;
    playing = true;
    paused = false;

    const schedule = generatePolyrhythmSchedule(state.ratioA, state.ratioB, state.bpm);
    loop = createSchedulingLoop({
      events: schedule.events,
      cycleDurationMs: schedule.cycleDurationMs,
      onEvent: handleEvent,
      onCycleEnd: handleCycleEnd,
    });
    loop.start();
  };

  const pause = (): void => {
    if (!playing) return;
    playing = false;
    paused = true;
    loop?.pause();
  };

  const stop = (): void => {
    playing = false;
    paused = false;
    cycleCount = 0;
    beat1Timestamp = 0;
    loop?.stop();
    loop = null;
  };

  return {
    play,
    pause,
    stop,
    isPlaying: () => playing,
    isPaused: () => paused,
    getCycleCount: () => cycleCount,
    getBeat1Timestamp: () => beat1Timestamp,
    setRatio: (a: number, b: number) => { state.ratioA = a; state.ratioB = b; },
    setBpm: (bpm: number) => { state.bpm = Math.max(20, Math.min(240, bpm)); },
    setSoundA: (s: SoundId) => { state.soundA = s; },
    setSoundB: (s: SoundId) => { state.soundB = s; },
    setVolumeA: (v: number) => { state.volumeA = v; },
    setVolumeB: (v: number) => { state.volumeB = v; },
    setMasterVolume: (v: number) => { state.masterVolume = v; },
    setStereoSplit: (enabled: boolean) => { state.stereoSplit = enabled; },
    getState: () => ({ ...state }),
    onBeat: (cb: BeatCallback) => beatCallbacks.subscribe(cb),
    onCycleComplete: (cb: CycleCallback) => cycleCallbacks.subscribe(cb),
  };
};
```

Commit: `feat(audio): add transport controls with play/pause/stop and callbacks`

---

## Chunk 4: Advanced Audio Features

### Task 10: Stereo Split

Already implemented inline in transport.ts `handleEvent`. Add dedicated test:

```typescript
// Add to transport.test.ts
it('applies stereo split panning when enabled', () => {
  const { playSound: mockPlay } = require('../sound-loader');
  const transport = createTransport();
  transport.setRatio(3, 2);
  transport.setBpm(120);
  transport.setStereoSplit(true);
  transport.play();
  jest.advanceTimersByTime(100);
  // Verify playSound called with pan -1 or 1
  const calls = mockPlay.mock.calls;
  expect(calls.some((c: unknown[]) => c[2] === -1 || c[2] === 1)).toBe(true);
});
```

Commit: `test(audio): add stereo split verification test`

---

### Task 11: Mute/Unmute with Volume Memory

**Files:**
- Create: `src/libs/audio/mute-manager.ts`
- Test: `src/libs/audio/__tests__/mute-manager.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/mute-manager.test.ts
import { createMuteManager } from '../mute-manager';

describe('MuteManager', () => {
  it('mute stores pre-mute volume and sets to 0', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.mute('A', 0.8, setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0);
  });

  it('unmute restores pre-mute volume', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.mute('A', 0.8, setVolume);
    manager.unmute('A', setVolume);
    expect(setVolume).toHaveBeenLastCalledWith('A', 0.8);
  });

  it('muteAll stores both volumes', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.muteAll(0.7, 0.9, setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0);
    expect(setVolume).toHaveBeenCalledWith('B', 0);
  });

  it('unmuteAll restores both volumes', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.muteAll(0.7, 0.9, setVolume);
    setVolume.mockClear();
    manager.unmuteAll(setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0.7);
    expect(setVolume).toHaveBeenCalledWith('B', 0.9);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/mute-manager.ts
type SetVolumeFn = (layer: 'A' | 'B', volume: number) => void;

export const createMuteManager = () => {
  let preMuteA: number | null = null;
  let preMuteB: number | null = null;

  const mute = (layer: 'A' | 'B', currentVolume: number, setVolume: SetVolumeFn): void => {
    if (layer === 'A') preMuteA = currentVolume;
    else preMuteB = currentVolume;
    setVolume(layer, 0);
  };

  const unmute = (layer: 'A' | 'B', setVolume: SetVolumeFn): void => {
    const vol = layer === 'A' ? preMuteA : preMuteB;
    if (vol !== null) {
      setVolume(layer, vol);
      if (layer === 'A') preMuteA = null;
      else preMuteB = null;
    }
  };

  const muteAll = (volA: number, volB: number, setVolume: SetVolumeFn): void => {
    preMuteA = volA;
    preMuteB = volB;
    setVolume('A', 0);
    setVolume('B', 0);
  };

  const unmuteAll = (setVolume: SetVolumeFn): void => {
    if (preMuteA !== null) setVolume('A', preMuteA);
    if (preMuteB !== null) setVolume('B', preMuteB);
    preMuteA = null;
    preMuteB = null;
  };

  return { mute, unmute, muteAll, unmuteAll };
};
```

Commit: `feat(audio): add mute/unmute manager with volume memory`

---

### Task 12: Fade Engine

**Files:**
- Create: `src/libs/audio/fade-engine.ts`
- Test: `src/libs/audio/__tests__/fade-engine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/libs/audio/__tests__/fade-engine.test.ts
import { createFadeEngine } from '../fade-engine';

describe('FadeEngine', () => {
  it('computes volume steps for a linear fade', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({
      layer: 'A',
      fromVolume: 1.0,
      targetVolume: 0.0,
      totalSteps: 4,
      setVolume,
    });

    // Simulate 4 beat ticks
    engine.tick('A'); // step 1: 0.75
    engine.tick('A'); // step 2: 0.50
    engine.tick('A'); // step 3: 0.25
    engine.tick('A'); // step 4: 0.00

    expect(setVolume).toHaveBeenCalledTimes(4);
    expect(setVolume).toHaveBeenLastCalledWith('A', 0);
  });

  it('fade is interruptible -- new fade cancels previous', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 4, setVolume });
    engine.tick('A'); // step 1: 0.75

    // Start new fade
    engine.startFade({ layer: 'A', fromVolume: 0.75, targetVolume: 1.0, totalSteps: 2, setVolume });
    engine.tick('A'); // step 1: 0.875
    engine.tick('A'); // step 2: 1.0

    const lastCall = setVolume.mock.calls[setVolume.mock.calls.length - 1];
    expect(lastCall).toEqual(['A', 1.0]);
  });

  it('cancelFade stops fade for a layer', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 4, setVolume });
    engine.tick('A');
    engine.cancelFade('A');
    setVolume.mockClear();
    engine.tick('A');
    expect(setVolume).not.toHaveBeenCalled();
  });

  it('independent fades on A and B', () => {
    const setVolume = jest.fn();
    const engine = createFadeEngine();

    engine.startFade({ layer: 'A', fromVolume: 1.0, targetVolume: 0.0, totalSteps: 2, setVolume });
    engine.startFade({ layer: 'B', fromVolume: 0.0, targetVolume: 1.0, totalSteps: 2, setVolume });

    engine.tick('A');
    engine.tick('B');
    engine.tick('A');
    engine.tick('B');

    const aCalls = setVolume.mock.calls.filter((c: unknown[]) => c[0] === 'A');
    const bCalls = setVolume.mock.calls.filter((c: unknown[]) => c[0] === 'B');
    expect(aCalls[aCalls.length - 1]).toEqual(['A', 0]);
    expect(bCalls[bCalls.length - 1]).toEqual(['B', 1.0]);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/libs/audio/fade-engine.ts
type FadeConfig = {
  layer: 'A' | 'B';
  fromVolume: number;
  targetVolume: number;
  totalSteps: number;
  setVolume: (layer: 'A' | 'B', volume: number) => void;
};

type FadeState = {
  currentStep: number;
  totalSteps: number;
  fromVolume: number;
  delta: number;
  setVolume: (layer: 'A' | 'B', volume: number) => void;
};

export const createFadeEngine = () => {
  const activeFades: Partial<Record<'A' | 'B', FadeState>> = {};

  const startFade = (config: FadeConfig): void => {
    const delta = (config.targetVolume - config.fromVolume) / config.totalSteps;
    activeFades[config.layer] = {
      currentStep: 0,
      totalSteps: config.totalSteps,
      fromVolume: config.fromVolume,
      delta,
      setVolume: config.setVolume,
    };
  };

  const tick = (layer: 'A' | 'B'): void => {
    const fade = activeFades[layer];
    if (!fade) return;

    fade.currentStep++;
    const newVolume = fade.fromVolume + fade.delta * fade.currentStep;
    const clamped = Math.max(0, Math.min(1, Math.round(newVolume * 1000) / 1000));

    fade.setVolume(layer, clamped);

    if (fade.currentStep >= fade.totalSteps) {
      delete activeFades[layer];
    }
  };

  const cancelFade = (layer: 'A' | 'B'): void => {
    delete activeFades[layer];
  };

  const hasFade = (layer: 'A' | 'B'): boolean => activeFades[layer] !== undefined;

  return { startFade, tick, cancelFade, hasFade };
};
```

Commit: `feat(audio): add linear fade engine with interruptible per-layer fades`

---

## Chunk 5: Zustand Store + Integration

### Task 13: audioStore

**Files:**
- Create: `src/data-access/stores/use-audio-store.ts`
- Test: `src/data-access/stores/__tests__/use-audio-store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/data-access/stores/__tests__/use-audio-store.test.ts
import { useAudioStore } from '../use-audio-store';
import { act } from '@testing-library/react-native';

describe('useAudioStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => {
      useAudioStore.getState().stop();
    });
  });

  afterEach(() => jest.useRealTimers());

  it('has correct initial state', () => {
    const state = useAudioStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.bpm).toBe(90);
    expect(state.ratioA).toBe(3);
    expect(state.ratioB).toBe(2);
    expect(state.soundA).toBe('click');
    expect(state.soundB).toBe('clave');
    expect(state.volumeA).toBe(0.8);
    expect(state.volumeB).toBe(0.8);
    expect(state.masterVolume).toBe(1.0);
    expect(state.stereoSplit).toBe(false);
    expect(state.cycleCount).toBe(0);
  });

  it('setBpm clamps to 20-240', () => {
    act(() => useAudioStore.getState().setBpm(300));
    expect(useAudioStore.getState().bpm).toBe(240);
    act(() => useAudioStore.getState().setBpm(5));
    expect(useAudioStore.getState().bpm).toBe(20);
  });

  it('setRatio updates both values', () => {
    act(() => useAudioStore.getState().setRatio(4, 3));
    expect(useAudioStore.getState().ratioA).toBe(4);
    expect(useAudioStore.getState().ratioB).toBe(3);
  });

  it('play sets isPlaying to true', () => {
    act(() => useAudioStore.getState().play());
    expect(useAudioStore.getState().isPlaying).toBe(true);
  });

  it('stop resets transport state', () => {
    act(() => useAudioStore.getState().play());
    act(() => useAudioStore.getState().stop());
    expect(useAudioStore.getState().isPlaying).toBe(false);
    expect(useAudioStore.getState().cycleCount).toBe(0);
  });

  it('muteLayer stores pre-mute volume', () => {
    act(() => useAudioStore.getState().muteLayer('A'));
    expect(useAudioStore.getState().volumeA).toBe(0);
  });

  it('unmuteLayer restores volume', () => {
    const origVol = useAudioStore.getState().volumeA;
    act(() => useAudioStore.getState().muteLayer('A'));
    act(() => useAudioStore.getState().unmuteLayer('A'));
    expect(useAudioStore.getState().volumeA).toBe(origVol);
  });
});
```

- [ ] **Step 3: Write implementation**

```typescript
// src/data-access/stores/use-audio-store.ts
import { create } from 'zustand';
import { createTransport } from '@libs/audio/transport';
import { createMuteManager } from '@libs/audio/mute-manager';
import { createFadeEngine } from '@libs/audio/fade-engine';
import { createTapTempo } from '@operations/polyrhythm';
import type { SoundId } from '@types';

type AudioState = {
  isPlaying: boolean;
  isPaused: boolean;
  bpm: number;
  ratioA: number;
  ratioB: number;
  soundA: SoundId;
  soundB: SoundId;
  volumeA: number;
  volumeB: number;
  masterVolume: number;
  stereoSplit: boolean;
  currentBeatA: number;
  currentBeatB: number;
  cycleCount: number;
};

type AudioActions = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  tapTempo: () => void;
  setRatio: (a: number, b: number) => void;
  setSoundA: (sound: SoundId) => void;
  setSoundB: (sound: SoundId) => void;
  setVolumeA: (volume: number) => void;
  setVolumeB: (volume: number) => void;
  setMasterVolume: (volume: number) => void;
  muteLayer: (layer: 'A' | 'B') => void;
  unmuteLayer: (layer: 'A' | 'B') => void;
  muteAll: () => void;
  unmuteAll: () => void;
  fadeLayer: (layer: 'A' | 'B', targetVolume: number, durationCycles: number) => void;
  setStereoSplit: (enabled: boolean) => void;
  getCurrentBeat1Timestamp: () => number;
  onBeat: (cb: (layer: 'A' | 'B', beatIndex: number, ts: number) => void) => () => void;
  onCycleComplete: (cb: (cycleCount: number) => void) => () => void;
};

const transport = createTransport();
const muteManager = createMuteManager();
const fadeEngine = createFadeEngine();
const tapTempoEngine = createTapTempo();

export const useAudioStore = create<AudioState & AudioActions>()((set, get) => ({
  // Initial state
  isPlaying: false,
  isPaused: false,
  bpm: 90,
  ratioA: 3,
  ratioB: 2,
  soundA: 'click',
  soundB: 'clave',
  volumeA: 0.8,
  volumeB: 0.8,
  masterVolume: 1.0,
  stereoSplit: false,
  currentBeatA: 0,
  currentBeatB: 0,
  cycleCount: 0,

  play: () => {
    const state = get();
    transport.setRatio(state.ratioA, state.ratioB);
    transport.setBpm(state.bpm);
    transport.setSoundA(state.soundA);
    transport.setSoundB(state.soundB);
    transport.setVolumeA(state.volumeA);
    transport.setVolumeB(state.volumeB);
    transport.setMasterVolume(state.masterVolume);
    transport.setStereoSplit(state.stereoSplit);
    transport.play();
    set({ isPlaying: true, isPaused: false });
  },

  pause: () => {
    transport.pause();
    set({ isPlaying: false, isPaused: true });
  },

  stop: () => {
    transport.stop();
    fadeEngine.cancelFade('A');
    fadeEngine.cancelFade('B');
    tapTempoEngine.reset();
    set({
      isPlaying: false,
      isPaused: false,
      currentBeatA: 0,
      currentBeatB: 0,
      cycleCount: 0,
    });
  },

  setBpm: (bpm) => {
    const clamped = Math.max(20, Math.min(240, bpm));
    transport.setBpm(clamped);
    set({ bpm: clamped });
  },

  tapTempo: () => {
    const result = tapTempoEngine.tap();
    if (result !== null) {
      get().setBpm(result);
    }
  },

  setRatio: (a, b) => {
    transport.setRatio(a, b);
    set({ ratioA: a, ratioB: b });
  },

  setSoundA: (sound) => {
    transport.setSoundA(sound);
    set({ soundA: sound });
  },

  setSoundB: (sound) => {
    transport.setSoundB(sound);
    set({ soundB: sound });
  },

  setVolumeA: (volume) => {
    fadeEngine.cancelFade('A');
    transport.setVolumeA(volume);
    set({ volumeA: volume });
  },

  setVolumeB: (volume) => {
    fadeEngine.cancelFade('B');
    transport.setVolumeB(volume);
    set({ volumeB: volume });
  },

  setMasterVolume: (volume) => {
    transport.setMasterVolume(volume);
    set({ masterVolume: volume });
  },

  muteLayer: (layer) => {
    const vol = layer === 'A' ? get().volumeA : get().volumeB;
    muteManager.mute(layer, vol, (l, v) => {
      transport[l === 'A' ? 'setVolumeA' : 'setVolumeB'](v);
      set(l === 'A' ? { volumeA: v } : { volumeB: v });
    });
  },

  unmuteLayer: (layer) => {
    muteManager.unmute(layer, (l, v) => {
      transport[l === 'A' ? 'setVolumeA' : 'setVolumeB'](v);
      set(l === 'A' ? { volumeA: v } : { volumeB: v });
    });
  },

  muteAll: () => {
    const { volumeA, volumeB } = get();
    muteManager.muteAll(volumeA, volumeB, (l, v) => {
      transport[l === 'A' ? 'setVolumeA' : 'setVolumeB'](v);
      set(l === 'A' ? { volumeA: v } : { volumeB: v });
    });
  },

  unmuteAll: () => {
    muteManager.unmuteAll((l, v) => {
      transport[l === 'A' ? 'setVolumeA' : 'setVolumeB'](v);
      set(l === 'A' ? { volumeA: v } : { volumeB: v });
    });
  },

  fadeLayer: (layer, targetVolume, durationCycles) => {
    const currentVol = layer === 'A' ? get().volumeA : get().volumeB;
    const ratio = layer === 'A' ? get().ratioA : get().ratioB;
    const totalSteps = durationCycles * ratio;
    fadeEngine.startFade({
      layer,
      fromVolume: currentVol,
      targetVolume,
      totalSteps,
      setVolume: (l, v) => {
        transport[l === 'A' ? 'setVolumeA' : 'setVolumeB'](v);
        set(l === 'A' ? { volumeA: v } : { volumeB: v });
      },
    });
  },

  setStereoSplit: (enabled) => {
    transport.setStereoSplit(enabled);
    set({ stereoSplit: enabled });
  },

  getCurrentBeat1Timestamp: () => transport.getBeat1Timestamp(),

  onBeat: (cb) => {
    const unsub = transport.onBeat((layer, beatIndex, ts) => {
      set(layer === 'A' ? { currentBeatA: beatIndex } : { currentBeatB: beatIndex });
      fadeEngine.tick(layer);
      cb(layer, beatIndex, ts);
    });
    return unsub;
  },

  onCycleComplete: (cb) => {
    const unsub = transport.onCycleComplete((count) => {
      set({ cycleCount: count });
      cb(count);
    });
    return unsub;
  },
}));
```

Commit: `feat(audio): add audioStore with full state, actions, and selectors`

---

### Task 14: Extension Point Stubs

**Files:**
- Create: `src/types/audio-engine.ts`

```typescript
// src/types/audio-engine.ts
// Extension point interfaces -- type-only, no implementation until P1

export type MicInputHook = {
  onOnsetDetected: (timestamp: number, amplitude: number) => void;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isListening: boolean;
};

export type AccelerometerHook = {
  onStompDetected: (timestamp: number, magnitude: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  sensitivity: number;
};

export type OnsetRecord = {
  timestamp: number;
  layer: 'A' | 'B';
  expectedTimestamp: number;
  deviationMs: number;
  accuracy: 'early' | 'late' | 'on-beat';
};

export type OnsetDetectionCallback = {
  reportOnset: (timestamp: number, layer: 'A' | 'B', deviationMs: number) => void;
  getSessionOnsets: () => OnsetRecord[];
  clearSessionOnsets: () => void;
};
```

Commit: `feat(audio): add P1 extension point type stubs`

---

### Task 15: Barrel Exports + Full Verification

- [ ] **Step 1: Create barrel export**

```typescript
// src/libs/audio/index.ts
export { preloadSounds, playSound, unloadSounds, isSoundLoaded } from './sound-loader';
export { computeFinalVolume, clampVolume } from './volume-utils';
export { createTransport } from './transport';
export { createFadeEngine } from './fade-engine';
export { createMuteManager } from './mute-manager';
export { createCallbackRegistry } from './callbacks';
export { createSchedulingLoop } from './scheduling-loop';
```

- [ ] **Step 2: Run all tests**

Run: `NODE_ENV=test TZ=UTC npx jest src/operations/polyrhythm/ src/libs/audio/ src/data-access/stores/__tests__/use-audio-store.test.ts --no-coverage`
Expected: ALL PASS

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Run linter**

Run: `npx eslint src/operations/polyrhythm/ src/libs/audio/ src/data-access/stores/use-audio-store.ts --max-warnings 0`
Expected: 0 errors, 0 warnings

- [ ] **Step 5: Commit**

`git add src/libs/audio/index.ts && git commit -m "feat(audio): add barrel exports and verify full audio engine"`

---

## Summary

| Chunk | Tasks | Tests | Key Deliverable |
|-------|-------|-------|-----------------|
| 1: Pure Math | 3 + barrel | 25+ | Schedule generator, tap tempo, LCM/GCD |
| 2: Sound System | 3 | 8+ | Sound loader with pool, volume utils |
| 3: Transport | 3 | 15+ | Scheduling loop, callbacks, play/pause/stop |
| 4: Advanced | 3 | 10+ | Stereo split, mute, fade engine |
| 5: Store + Integration | 3 | 10+ | audioStore, extension stubs, verification |
| **Total** | **15 + barrel** | **68+** | Full audio engine foundation |

## Dependency Chain

```
Chunk 1 (Pure Math) -- no deps
  |
  v
Chunk 2 (Sound System) -- needs expo-av
  |
  v
Chunk 3 (Transport) -- needs Chunks 1 + 2
  |
  v
Chunk 4 (Advanced) -- needs Chunk 3
  |
  v
Chunk 5 (Store) -- needs all above
```

> **Type Source:** All types MUST match `development/contracts/data-models.md`.
> If types in this plan differ from data-models.md, data-models.md is authoritative.
> Update this plan to match, not the other way around.

---

## Done Criteria
- [ ] Audio latency spike passes (jitter < 10ms iOS, < 20ms Android)
- [ ] Two layers play simultaneously with correct timing
- [ ] Stereo split works on both iOS and Android devices
- [ ] BPM changes take effect at next cycle boundary
- [ ] All SoundId assets exist and load correctly
- [ ] Transport controls (play/stop/pause) work reliably
- [ ] Audio interruptions handled (phone calls, headphone disconnect)
