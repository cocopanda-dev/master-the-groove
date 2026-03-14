# Audio Engine — Foundation Spec

**Foundation:** Audio Engine
**Status:** Not Started
**Dependencies:** None (leaf foundation)
**Consumers:** Polyrhythm Player, Disappearing Beat, Feel Lessons, Baby Mode, Body Layer Mode

---

## Prerequisite: Audio Latency Spike (MUST complete first)

Before implementing any audio engine code, build a minimal proof-of-concept:
- Two audio layers playing simultaneously at 120 BPM
- Stereo split (layer A left, layer B right)
- Measure round-trip latency: schedule time → audible output
- Test on: iOS simulator, iOS device, Android emulator, lowest-end target Android device
- **Pass criteria:** Per-beat jitter < 10ms on iOS, < 20ms on Android
- **If expo-av fails:** Pivot to native audio modules (Oboe on Android, AVAudioEngine on iOS)
- This spike should take ~2 hours and determines the entire audio architecture

---

## Overview

The audio engine is the rhythmic brain of GrooveCore. It owns all sound scheduling, playback, tempo management, and transport state. Every feature that produces sound or reacts to beats consumes this foundation through the `audioStore` Zustand slice and exported hooks. The audio engine itself has zero knowledge of UI, screens, or feature-level logic.

---

## 1. Polyrhythm Scheduler

The scheduler is a **pure function** that, given a ratio A:B and a BPM, computes the exact millisecond timestamps for every hit in one full polyrhythmic cycle.

### Algorithm

1. **Cycle length calculation:**
   - One full cycle = LCM(A, B) beats at the base BPM.
   - `cycleDurationMs = (LCM(A, B) / BPM) * 60000`
   - Example: 3:2 at 120 BPM. LCM(3,2) = 6. Cycle = (6/120)*60000 = 3000ms.

### BPM Definition

BPM refers to the rate of the LCM pulse (the shared subdivision).
For 3:2 at 120 BPM: LCM(3,2) = 6, so 120 subdivisions per minute.
- Layer A fires every 2 subdivisions (60 hits/min)
- Layer B fires every 3 subdivisions (40 hits/min)
- Cycle = 6 subdivisions = 6/120 * 60000 = 3000ms

Alternative interpretation (BPM = Layer B rate) would give different results.
All specs and UI must use this LCM-subdivision interpretation consistently.

2. **Layer A timestamps:**
   - Layer A plays `A` evenly-spaced hits across the cycle.
   - `intervalA = cycleDurationMs / A`
   - Timestamps: `[0, intervalA, 2*intervalA, ..., (A-1)*intervalA]`

3. **Layer B timestamps:**
   - Layer B plays `B` evenly-spaced hits across the cycle.
   - `intervalB = cycleDurationMs / B`
   - Timestamps: `[0, intervalB, 2*intervalB, ..., (B-1)*intervalB]`

4. **Merged timeline:**
   - Merge both arrays into a single sorted array of event objects.
   - Each event: `{ time: number (ms), layer: 'A' | 'B', beatIndex: number }`
   - When A and B have coincident hits (e.g., beat 1), both events exist at the same timestamp.

### Supported Ratios

MVP: 3:2, 4:3, 2:3 (reverse)
Full support: all integer ratios from 2:1 through 9:8, including reverses (e.g., 2:3, 3:4).

### Function Signature

```typescript
type ScheduleEvent = {
  time: number;       // milliseconds from cycle start
  layer: 'A' | 'B';
  beatIndex: number;  // 0-indexed within that layer
};

function generatePolyrhythmSchedule(
  ratioA: number,
  ratioB: number,
  bpm: number
): {
  events: ScheduleEvent[];
  cycleDurationMs: number;
  lcm: number;
}
```

### Constraints

- This function must be **pure** — no side effects, no imports of audio modules.
- Must be unit-testable in isolation.
- Floating point timestamps are acceptable; rounding happens at the playback layer.

---

## 2. Sound Loader

### Preloading Strategy

At app initialization, preload all MVP sound files using `expo-av` `Audio.Sound.createAsync()`. Store loaded sound objects in a module-level cache keyed by sound name.

### Sound Pool

To avoid creation latency during rapid playback, maintain a **pool of pre-created sound instances** per sound type.

- **Pool size:** 4 instances per sound type.
- Pool is implemented as a circular buffer. On each play request, advance the index and reuse the next instance (calling `replayAsync()` or `setPositionAsync(0)` + `playAsync()`).
- If a sound instance is still playing when its turn comes, stop it before replaying.

Each layer has its own independent sound pool. Layer A pool and Layer B pool
are separate (even if they use the same sound type). This prevents cross-layer
contention when beats from both layers fire near-simultaneously.

### Sound Files

**MVP sounds:**
| Sound Name | File | Character |
|------------|------|-----------|
| `click` | `assets/sounds/click.wav` | Neutral metronome tick |
| `clave` | `assets/sounds/clave.wav` | Wooden clave hit |
| `woodblock` | `assets/sounds/woodblock.wav` | Warm woodblock tap |

**Post-MVP stubs (P1+):**
| Sound Name | File | Character |
|------------|------|-----------|
| `djembe` | `assets/sounds/djembe.wav` | Deep hand drum |
| `handpan` | `assets/sounds/handpan.wav` | Melodic resonant hit |
| `soft-chime` | `assets/sounds/soft-chime.wav` | Baby mode — gentle chime |
| `soft-bell` | `assets/sounds/soft-bell.wav` | Baby mode — soft bell |

Post-MVP sounds should have type definitions and loader stubs but no actual audio files yet.

Audio format requirements: WAV, 44.1kHz, 16-bit, mono, < 200ms per sample (see `design-tokens.md`, Audio section for canonical values).

### Sound Loader Interface

```typescript
// Uses `SoundId` type from canonical `data-models.md`
type SoundId = 'click' | 'clave' | 'woodblock' | 'djembe' | 'handpan' | 'soft-chime' | 'soft-bell';

async function preloadSounds(): Promise<void>;
async function playSound(name: SoundId, volume: number, pan: number): Promise<void>;
async function unloadSounds(): Promise<void>;
function isSoundLoaded(name: SoundId): boolean;
```

---

## 3. Stereo Split

Stereo split allows each polyrhythm layer to be panned to a separate ear when using headphones.

### Behavior

| State | Layer A Pan | Layer B Pan |
|-------|------------|------------|
| Stereo split ON | -1.0 (full left) | 1.0 (full right) |
| Stereo split OFF | 0.0 (center) | 0.0 (center) |

### Control

- Toggled via `audioStore.setStereoSplit(boolean)`.
- Pan value is applied at `playSound()` time by setting the pan parameter on the `expo-av` sound instance.
- Changes take effect on the next played note (not mid-note).

### Platform Validation Required

`expo-av` pan control behavior varies by platform:
- iOS: AVAudioPlayer does NOT natively support pan. May require AVAudioEngine or a native module.
- Android: Pan works with MediaPlayer but may not with SimpleExoPlayer.

**Validation task:** Test stereo split on both platforms early. If pan is unavailable,
fallback options: (1) pre-rendered stereo audio files, (2) native audio module, (3) dual Audio.Sound instances routed to separate channels.

### Safety Note

When stereo split is activated, the app should display a brief headphone notice: "Best experienced with headphones. Keep volume moderate." This notice is a UI concern owned by the feature layer, not the audio engine — but the engine exposes `stereoSplit` state for the UI to react to.

---

## 4. Volume Control

### Per-Layer Volume

- Each layer (A and B) has an independent volume: `number` in range `[0.0, 1.0]`, default `0.8`.
- Stored in `audioStore` as `volumeA` and `volumeB`.

### Master Volume

- `masterVolume`: `number` in range `[0.0, 1.0]`, default `1.0`.
- Final playback volume for a layer = `layerVolume * masterVolume`.

### Fade Curves (Disappearing Beat Support)

The audio engine provides a `fadeLayer` function for smooth volume transitions used by Disappearing Beat mode.

```typescript
function fadeLayer(
  layer: 'A' | 'B',
  targetVolume: number,   // 0.0 to 1.0
  durationBars: number    // number of full A:B cycles over which to fade
): void;
```

**Fade implementation:**
- Fade is **linear** (MVP). Post-MVP may support ease-in/ease-out curves.
- The fade calculates intermediate volume values and applies them on each beat callback.
- Steps per fade = number of beats in `durationBars` cycles for that layer.
- Volume delta per step = `(targetVolume - currentVolume) / steps`.
- Fade can be interrupted: calling `fadeLayer` again on the same layer cancels the previous fade and starts a new one.
- Calling `setVolume` directly during a fade cancels the fade.

### Mute

- `muteLayer(layer: 'A' | 'B')` is shorthand for `setVolume(layer, 0.0)`.
- `unmuteLayer(layer: 'A' | 'B')` restores the volume to the value before mute was called.
- Pre-mute volume is stored internally so unmute is lossless.

---

## 5. Tempo Engine

### BPM State

- Type: `number`
- Hard range: 20–240 BPM (validated on set)
- MVP practical range: 40–160 BPM (UI restricts the slider, but the engine accepts the full range)
- Default: 90 BPM
- Stored in `audioStore.bpm`

### Tap Tempo

Algorithm:
1. On each tap, record `Date.now()` timestamp.
2. Keep the **last 4 tap timestamps** in a circular buffer.
3. When buffer has >= 2 entries, compute the average interval between consecutive taps.
4. Convert average interval to BPM: `60000 / averageIntervalMs`.
5. Clamp to valid BPM range.
6. If the interval between the current tap and the last tap exceeds 2 seconds, reset the buffer (user paused).

```typescript
function tapTempo(): number; // returns computed BPM
```

### Smooth Tempo Transition

When BPM changes during playback:
1. Wait until the next cycle boundary (do NOT change mid-cycle)
2. At the cycle boundary, apply the new BPM for all subsequent cycles
3. No interpolation within a cycle — tempo changes are quantized to cycle boundaries
4. The UI slider shows the target BPM immediately, audio catches up at next cycle

This is simpler than mid-cycle interpolation and avoids the complexity of
recalculating in-flight events. The latency is at most one cycle duration.

---

## 6. Transport Controls

### Scheduling Strategy: Lookahead Pattern

Do NOT rely on `setTimeout` for beat-accurate scheduling. Instead:
1. Use a lookahead scheduler that runs every ~25ms (via `setTimeout` or `setInterval`)
2. Each tick, check the high-resolution clock and schedule ALL events within the next ~100ms window
3. Events are scheduled using the audio system's clock (not JS `Date.now()`)
4. This decouples scheduling precision from JS thread timing
5. Visual callbacks fire from the scheduling tick, offset by `audioLatencyOffsetMs` from settings

The `setTimeout` drives the scheduling loop, but individual beat events are pre-scheduled
against the audio clock, making them immune to JS thread jitter.

### play()

1. If already playing, no-op.
2. Generate the polyrhythm schedule for the current ratio and BPM.
3. Record `cycleStartTime` using high-resolution timer (`performance.now()`).
4. Start the lookahead scheduling loop (~25ms interval):
   - On each tick, check the high-resolution clock.
   - Schedule all events within the next ~100ms lookahead window against the audio clock.
   - On event fire: call `playSound()` with the appropriate sound, volume, and pan; fire `onBeat` callback.
5. At end of cycle: increment `cycleCount`, fire `onCycleComplete`, loop back to step 2 with a fresh schedule.

### pause()

1. Stop the scheduling loop.
2. Record the elapsed position within the current cycle.
3. Set `isPlaying = false`.
4. On next `play()`, resume from the paused position within the cycle.

### stop()

1. Stop the scheduling loop.
2. Reset cycle position to 0.
3. Reset `cycleCount` to 0.
4. Set `isPlaying = false`.
5. Reset `currentBeatA` and `currentBeatB` to 0.

### Cycle Counter

- `cycleCount: number` — increments by 1 each time the full LCM cycle completes.
- Reset to 0 on `stop()`.
- Not reset on `pause()`.

### Beat Callbacks

```typescript
type BeatCallback = (layer: 'A' | 'B', beatIndex: number, timestamp: number) => void;
type CycleCallback = (cycleCount: number) => void;

// Registration
function onBeat(callback: BeatCallback): () => void;           // returns unsubscribe
function onCycleComplete(callback: CycleCallback): () => void;  // returns unsubscribe
```

- `onBeat` fires on every scheduled hit so the UI can update visualizers and detect user taps.
- `onCycleComplete` fires at beat 1 of each new cycle (the boundary between cycles), providing the `cycleCount` and the precise timestamp. This is the callback Disappearing Beat uses for stage transitions.
- `getCurrentBeat1Timestamp()` returns the precise ms timestamp of the most recent beat 1 — used by Disappearing Beat for drift calculation.

Stage transitions are owned by the feature layer (Disappearing Beat mode).
The audio engine provides `fadeLayer()` and `muteAll()`/`unmuteAll()` primitives.
The feature layer calls these primitives and manages the stage state machine.
Remove `onStageTransition` callback and `triggerStageTransition` from the engine API —
these belong in the feature layer, not the audio engine.

All callbacks are synchronous and must not block. Heavy work should be deferred.

---

## 7. Zustand Store Slice (audioStore)

### State Shape

```typescript
interface AudioState {
  // Transport
  isPlaying: boolean;
  isPaused: boolean;

  // Tempo
  bpm: number;

  // Ratio
  ratioA: number;
  ratioB: number;

  // Sounds
  soundA: SoundId;
  soundB: SoundId;

  // Volume
  volumeA: number;
  volumeB: number;
  masterVolume: number;

  // Stereo
  stereoSplit: boolean;

  // Beat tracking
  currentBeatA: number;
  currentBeatB: number;
  cycleCount: number;

  // Internal (not exposed to features)
  _tapBuffer: number[];
  _preMuteVolumeA: number | null;
  _preMuteVolumeB: number | null;
  _activeFadeA: FadeState | null;  // See `data-models.md` for the `FadeState` type definition
  _activeFadeB: FadeState | null;
}
```

### Actions

```typescript
interface AudioActions {
  // Transport
  play: () => void;
  pause: () => void;
  stop: () => void;

  // Tempo
  setBpm: (bpm: number) => void;
  tapTempo: () => void;

  // Ratio
  setRatio: (a: number, b: number) => void;

  // Sound
  setSoundA: (sound: SoundId) => void;
  setSoundB: (sound: SoundId) => void;

  // Volume
  setVolumeA: (volume: number) => void;
  setVolumeB: (volume: number) => void;
  setMasterVolume: (volume: number) => void;
  muteLayer: (layer: 'A' | 'B') => void;
  unmuteLayer: (layer: 'A' | 'B') => void;
  muteAll: () => void;           // Mutes both layers simultaneously (stores pre-mute volumes)
  unmuteAll: () => void;         // Restores both layers to pre-mute volumes
  fadeLayer: (layer: 'A' | 'B', targetVolume: number, durationBars: number) => void;
  getCurrentBeat1Timestamp: () => number;  // Returns the ms timestamp of the most recent beat 1 (cycle start)

  // Stereo
  setStereoSplit: (enabled: boolean) => void;

  // Callbacks
  onBeat: (callback: BeatCallback) => () => void;
  onCycleComplete: (callback: CycleCallback) => () => void;
}
```

### Selectors

```typescript
const selectIsPlaying = (state: AudioState) => state.isPlaying;
const selectBpm = (state: AudioState) => state.bpm;
const selectCurrentBeats = (state: AudioState) => ({
  beatA: state.currentBeatA,
  beatB: state.currentBeatB,
});
const selectCycleCount = (state: AudioState) => state.cycleCount;
const selectRatio = (state: AudioState) => ({ a: state.ratioA, b: state.ratioB });
const selectVolumes = (state: AudioState) => ({
  volumeA: state.volumeA,
  volumeB: state.volumeB,
  master: state.masterVolume,
});
const selectStereoSplit = (state: AudioState) => state.stereoSplit;
```

### Persistence

The audio store is **not persisted** to AsyncStorage. Audio state is ephemeral — it resets on app restart. User preferences (default BPM, preferred sounds) live in `settingsStore`, which is persisted.

---

## 8. Extension Points (P1+)

These interfaces are defined now but implemented as no-ops. They exist so that P1 features can plug in without modifying the audio engine core.

### micInputHook

```typescript
interface MicInputHook {
  onOnsetDetected: (timestamp: number, amplitude: number) => void;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isListening: boolean;
}
```

Used by: AI Vocal Coach (P1), Sing & Tap mode.

### accelerometerHook

```typescript
interface AccelerometerHook {
  onStompDetected: (timestamp: number, magnitude: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  sensitivity: number; // 0.0 to 1.0
}
```

Used by: Body Layer Mode (P1), Baby Mode stomp detection (P2).

### onsetDetectionCallback

```typescript
interface OnsetDetectionCallback {
  reportOnset: (timestamp: number, layer: 'A' | 'B', deviationMs: number) => void;
  getSessionOnsets: () => OnsetRecord[];
  clearSessionOnsets: () => void;
}

type OnsetRecord = {
  timestamp: number;
  layer: 'A' | 'B';
  expectedTimestamp: number;
  deviationMs: number;
  accuracy: 'early' | 'late' | 'on-beat';
};
```

Used by: AI Vocal Coach analysis, drift detection in Disappearing Beat feedback.

---

## Audio Interruption Handling

### iOS (AVAudioSession)
- Category: `.playback` (allows background audio, mixes with system sounds)
- Handle interruption notifications: pause on interruption begin, do NOT auto-resume on end
- Handle route changes: pause on headphone disconnect, continue on reconnect

### Android (Audio Focus)
- Request `AUDIOFOCUS_GAIN` when starting playback
- On `AUDIOFOCUS_LOSS`: stop playback, release resources
- On `AUDIOFOCUS_LOSS_TRANSIENT`: pause playback
- On `AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK`: reduce volume to 20%

### Background Behavior
- Audio continues when app goes to background (metronome/practice use case)
- Audio pauses when screen is locked (configurable in settingsStore: `playInBackground`)
- Phone calls: always pause, show "Resume" prompt when call ends

---

## Audio Session Configuration (Task required for both platforms)

On app startup, configure:
- iOS: `AVAudioSession.setCategory(.playback, options: [.mixWithOthers])`
- Android: Register audio focus change listener
- Both: Handle Bluetooth headphone connect/disconnect events

---

## Background Audio

- Default: audio continues when app backgrounds (like a metronome)
- `settingsStore.playInBackground`: if false, pause on background
- Always pause on: phone call, Siri/Google Assistant activation
- Resume behavior: show "Paused" overlay, user taps to resume (no auto-resume)

---

## Audio Assets

Sound files must be sourced/created before audio engine testing:
- `click.wav` — neutral click (woodblock-like)
- `clave.wav` — clave hit
- `woodblock.wav` — woodblock hit
- `soft-chime.wav` — for baby mode (gentle, high register)
- `soft-bell.wav` — for baby mode (warm, sustained)

Requirements: WAV, 44.1kHz, 16-bit, mono, < 200ms, royalty-free.
These MUST exist before any audio integration testing. See Task 0 in tasks.md.

---

## 9. Boundaries & Constraints

### What the audio engine owns:
- All sound scheduling and playback
- Tempo state and tap tempo calculation
- Volume and pan control
- Transport state (play/pause/stop)
- Beat and cycle event dispatching
- Polyrhythm schedule generation

### What the audio engine does NOT own:
- UI rendering of any kind
- Screen navigation
- Feature-level logic (disappearing beat stages, lesson steps, etc.)
- User data or session logging
- Settings persistence (that is `settingsStore`)
- Microphone access or onset detection (that is the P1 extension)

### Import rules:
- Features may import from `@/foundations/audio-engine` (the public API: store, hooks, types).
- Features must NOT import from `@/foundations/audio-engine/internals` or reach into scheduler/loader implementation files.
- The audio engine must NOT import from any feature or any other foundation.

---

## 10. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `expo-av` playback latency on Android | Rhythm feels loose, unusable | Pool pre-created sound instances; evaluate `expo-audio` or native module if latency > 20ms |
| JS thread timing drift over many cycles | Beats slowly go out of sync | Use lookahead scheduler against audio clock; anchor each cycle to wall-clock time, not cumulative timeouts |
| Sound pool exhaustion at high BPM | Missed notes | Pool size 4 handles up to ~240 BPM for 9-note layers; monitor and increase if needed |
| Rapid ratio/BPM changes during playback | Glitchy audio | Queue changes to apply at next cycle boundary; interpolate BPM changes over 1 beat |
