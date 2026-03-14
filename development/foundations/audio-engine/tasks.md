# Audio Engine — Implementation Tasks

**Foundation:** Audio Engine
**Spec:** [./spec.md](./spec.md)
**Estimated Effort:** ~10-14 days (includes mandatory latency spike, asset sourcing, and platform validation tasks. The audio engine is the highest-risk foundation and should not be rushed.)

---

## Task 0: Audio Latency Spike (Prerequisite)

- [ ] Build minimal PoC: two expo-av Sound instances, 120 BPM, stereo split
- [ ] Measure: schedule-to-audible latency on iOS device and Android device
- [ ] Measure: per-beat jitter over 30 seconds of playback
- [ ] Pass criteria: jitter < 10ms iOS, < 20ms Android
- [ ] If fail: document findings, propose native module approach
- [ ] Estimate: 2-4 hours
- **This task BLOCKS all subsequent tasks**

---

## Task 1: Set Up Audio Module Structure

- [ ] Create the directory structure:
  ```
  src/foundations/audio-engine/
  ├── index.ts              # Public API barrel export
  ├── store.ts              # Zustand audioStore slice
  ├── scheduler.ts          # Pure polyrhythm schedule generator
  ├── soundLoader.ts        # expo-av sound loading and pool management
  ├── transport.ts          # Play/pause/stop scheduling loop
  ├── tempoEngine.ts        # BPM state, tap tempo, smooth transitions
  ├── types.ts              # All TypeScript interfaces and types
  ├── constants.ts          # Sound file paths, default values, limits
  └── hooks.ts              # React hooks wrapping store selectors
  ```
- [ ] Define all TypeScript types in `types.ts`: `ScheduleEvent`, `SoundId`, `BeatCallback`, `CycleCallback`, `AudioState`, `AudioActions`, `FadeState`, `MicInputHook`, `AccelerometerHook`, `OnsetDetectionCallback`, `OnsetRecord`.
- [ ] Define all constants in `constants.ts`: `BPM_MIN`, `BPM_MAX`, `BPM_DEFAULT`, `VOLUME_DEFAULT`, `SOUND_POOL_SIZE`, `TAP_BUFFER_SIZE`, `TAP_TIMEOUT_MS`, `SOUND_FILE_MAP`.
- [ ] Set up `index.ts` barrel export that exposes only the public API (store, hooks, types, constants).

**Acceptance Criteria:**
- All files exist and compile with zero TypeScript errors.
- Importing from `@/foundations/audio-engine` resolves correctly.
- No circular dependencies between internal files.

---

## Task 2: Implement Polyrhythm Scheduler Algorithm

- [ ] Implement `generatePolyrhythmSchedule(ratioA, ratioB, bpm)` in `scheduler.ts`.
- [ ] Implement helper `lcm(a, b)` and `gcd(a, b)` functions.
- [ ] The function returns `{ events: ScheduleEvent[], cycleDurationMs: number, lcm: number }`.
- [ ] Events array is sorted by `time` ascending. Coincident events (same time, different layers) are both present and sorted layer A before B.
- [ ] Validate inputs: ratioA and ratioB must be positive integers >= 1 and <= 12. BPM must be in valid range.

**Acceptance Criteria:**
- `generatePolyrhythmSchedule(3, 2, 120)` returns 5 events (3 for A, 2 for B) spanning a 3000ms cycle, with beat 1 of both layers at time 0.
- `generatePolyrhythmSchedule(4, 3, 60)` returns 7 events spanning a 12000ms cycle.
- Invalid inputs throw descriptive errors.
- Function is pure — no side effects, no module-level state accessed.

---

## Task 3: Implement Sound Loader with expo-av

- [ ] Implement `preloadSounds()` that loads all MVP sound files (`click`, `clave`, `woodblock`) using `Audio.Sound.createAsync()`.
- [ ] Implement sound pool: for each sound type, create an array of 4 `Audio.Sound` instances (circular buffer).
- [ ] Implement `playSound(name, volume, pan)` that picks the next instance from the pool, sets volume and pan via `setStatusAsync()`, and calls `replayAsync()`.
- [ ] Implement `unloadSounds()` that calls `unloadAsync()` on all pooled instances.
- [ ] Implement `isSoundLoaded(name)` check.
- [ ] Handle pool exhaustion gracefully: if all 4 instances are somehow in a bad state, log a warning and skip the note rather than crashing.
- [ ] Add stub entries in the sound map for post-MVP sounds (`djembe`, `handpan`, `soft-chime`, `soft-bell`) that log a "sound not available" warning if played.

**Acceptance Criteria:**
- After calling `preloadSounds()`, `isSoundLoaded('click')` returns true for all MVP sounds.
- Calling `playSound('click', 0.8, 0.0)` plays the sound without audible delay (< 20ms from call to audible output on iOS).
- Rapid successive calls to `playSound` (simulating fast BPM) do not crash or produce errors — the pool rotates correctly.
- `unloadSounds()` releases all resources; subsequent `isSoundLoaded` calls return false.

---

## Task 4: Implement Stereo Split Pan Control

- [ ] Add `stereoSplit` boolean to `audioStore` state, default `false`.
- [ ] Implement `setStereoSplit(enabled: boolean)` action.
- [ ] In the transport layer's event firing logic, compute the pan value per layer:
  - If `stereoSplit` is true: layer A pan = -1.0, layer B pan = 1.0.
  - If `stereoSplit` is false: both layers pan = 0.0.
- [ ] Pass the computed pan value to `playSound()` on each hit.

**Acceptance Criteria:**
- With stereo split ON and headphones, layer A is audible only in the left ear, layer B only in the right ear.
- Toggling stereo split OFF during playback results in both layers centered on the next played note.
- The `stereoSplit` state is readable from the store so UI can display the toggle state.

---

## Task 5: Implement Volume Control with Fade Curves

- [ ] Implement `setVolumeA(volume)`, `setVolumeB(volume)`, `setMasterVolume(volume)` actions.
- [ ] Clamp all volume values to `[0.0, 1.0]` range.
- [ ] Implement effective volume calculation: `effectiveVolume = layerVolume * masterVolume`.
- [ ] Implement `muteLayer(layer)`: stores current volume in `_preMuteVolume{A|B}`, sets volume to 0.
- [ ] Implement `unmuteLayer(layer)`: restores volume from `_preMuteVolume{A|B}`, clears the stored value.
- [ ] Implement `fadeLayer(layer, targetVolume, durationBars)`:
  - Calculate total steps = number of beats for that layer across `durationBars` cycles.
  - Calculate volume delta per step.
  - On each `onBeat` callback for that layer, apply the next volume step.
  - Store fade state in `_activeFade{A|B}`.
  - If a new fade is requested while one is active, cancel the old one.
  - If `setVolume` is called directly during a fade, cancel the fade.

**Acceptance Criteria:**
- Setting `volumeA` to 0.5 and `masterVolume` to 0.5 results in effective playback volume of 0.25.
- `muteLayer('A')` followed by `unmuteLayer('A')` restores the original volume exactly.
- `fadeLayer('A', 0.0, 4)` gradually reduces layer A volume to zero over 4 full cycles, with volume changing on each beat of layer A.
- Calling `fadeLayer` during an active fade replaces it cleanly without volume jumps.

---

## Task 6: Implement Tempo Engine with Tap Tempo

- [ ] Implement `setBpm(bpm)` with validation and clamping to `[BPM_MIN, BPM_MAX]`.
- [ ] Implement tap tempo buffer: circular buffer of last 4 timestamps.
- [ ] Implement `tapTempo()`:
  - Record `Date.now()`.
  - If gap since last tap > 2000ms, reset the buffer.
  - If buffer has >= 2 entries, compute average interval and derive BPM.
  - Clamp to valid range and call `setBpm`.
  - Return the computed BPM.
- [ ] Implement smooth tempo transition:
  - When `setBpm` is called during active playback, store target BPM but do not apply mid-cycle.
  - At the next cycle boundary, apply the new BPM for all subsequent cycles.
  - No interpolation within a cycle — tempo changes are quantized to cycle boundaries.
  - The UI slider shows the target BPM immediately, audio catches up at next cycle.

**Acceptance Criteria:**
- Tapping 4 times at 500ms intervals (120 BPM) results in `tapTempo()` returning approximately 120.
- A tap arriving 3 seconds after the last tap resets the buffer, and the next `tapTempo()` call returns `undefined`/null until 2+ taps are recorded.
- Changing BPM from 120 to 60 during playback applies the change at the next cycle boundary (not mid-cycle).

---

## Task 7: Implement Transport Controls

- [ ] Implement `play()`:
  - Generate schedule via `generatePolyrhythmSchedule`.
  - Record cycle start time using high-resolution timer (`performance.now()`).
  - Start the lookahead scheduling loop (~25ms interval via `setTimeout`/`setInterval`).
  - Each tick: schedule all events within the next ~100ms window against the audio clock.
  - Anchor timing to wall clock on each cycle start to prevent drift.
  - Set `isPlaying = true`, `isPaused = false`.
- [ ] Implement `pause()`:
  - Clear the lookahead scheduling interval and all pending scheduled events.
  - Record elapsed position within the cycle.
  - Set `isPlaying = false`, `isPaused = true`.
- [ ] Implement resume (calling `play()` when `isPaused` is true):
  - Recalculate remaining events from the paused position.
  - Resume scheduling loop.
- [ ] Implement `stop()`:
  - Clear all pending timeouts.
  - Reset cycle position, `cycleCount`, `currentBeatA`, `currentBeatB` to 0.
  - Set `isPlaying = false`, `isPaused = false`.
- [ ] Implement cycle looping:
  - At end of cycle, increment `cycleCount`, fire `onCycleComplete`, generate next schedule, continue.
  - Self-correct timing: next cycle start = previous cycle start + cycleDurationMs (wall clock anchored).

**Acceptance Criteria:**
- Calling `play()` with ratio 3:2 at 120 BPM results in audible beats at the correct timestamps (verifiable by recording and analyzing).
- `pause()` followed by `play()` resumes from the paused position, not from the beginning.
- `stop()` fully resets — next `play()` starts from beat 1, cycle 0.
- After 10 cycles, timing drift is < 5ms (wall clock anchored scheduling prevents cumulative drift).

---

## Task 8: Wire Up Zustand audioStore Slice

- [ ] Create the Zustand store in `store.ts` with the full `AudioState` and `AudioActions` interface.
- [ ] Set initial state: `isPlaying: false`, `bpm: 90`, `ratioA: 3`, `ratioB: 2`, `soundA: 'click'`, `soundB: 'clave'`, `volumeA: 0.8`, `volumeB: 0.8`, `masterVolume: 1.0`, `stereoSplit: false`, `currentBeatA: 0`, `currentBeatB: 0`, `cycleCount: 0`.
- [ ] Wire all actions to their implementations in `transport.ts`, `tempoEngine.ts`, `soundLoader.ts`.
- [ ] Create React hooks in `hooks.ts`:
  - `useAudioStore()` — full store hook.
  - `useIsPlaying()` — `selectIsPlaying`.
  - `useBpm()` — `selectBpm`.
  - `useCurrentBeats()` — `selectCurrentBeats`.
  - `useCycleCount()` — `selectCycleCount`.
  - `useRatio()` — `selectRatio`.
  - `useVolumes()` — `selectVolumes`.
  - `useStereoSplit()` — `selectStereoSplit`.
- [ ] Verify that store updates trigger React re-renders only for subscribed selectors (Zustand's default behavior).

**Acceptance Criteria:**
- `useIsPlaying()` returns `true` after `play()` is called and `false` after `stop()`.
- Changing `bpm` via `setBpm` is reflected immediately in components using `useBpm()`.
- Store actions are callable from any component or non-component context (e.g., the transport loop can call `set()` directly).
- No store persistence middleware is applied (audio state is ephemeral).

---

## Task 9: Add Beat Callback System

- [ ] Implement a callback registry (array of callbacks) for `onBeat` and `onCycleComplete`.
- [ ] Each registration function returns an unsubscribe function that removes the callback from the registry.
- [ ] In the transport loop, when an event fires:
  - Update `currentBeatA` or `currentBeatB` in the store.
  - Call all registered `onBeat` callbacks with `(layer, beatIndex, timestamp)`.
- [ ] At cycle completion, call all registered `onCycleComplete` callbacks with `(cycleCount)`.
- [ ] Guard against callback errors: wrap each callback invocation in try-catch so one failing callback does not break the scheduling loop.
- [ ] Note: Stage transitions are owned by the feature layer (Disappearing Beat), not the audio engine. The engine provides `fadeLayer()` and `muteAll()`/`unmuteAll()` primitives only.

**Acceptance Criteria:**
- A component registering `onBeat` receives exactly `ratioA + ratioB` callbacks per cycle (e.g., 5 for 3:2).
- Unsubscribing prevents further callbacks — no memory leaks after component unmount.
- A callback that throws an error does not stop playback or prevent other callbacks from firing.
- `onCycleComplete` fires exactly once per cycle, with the correct incrementing `cycleCount`.

---

## Task 10: Add Extension Point Interfaces

- [ ] Define `MicInputHook` interface in `types.ts` with `onOnsetDetected`, `startListening`, `stopListening`, `isListening`.
- [ ] Define `AccelerometerHook` interface in `types.ts` with `onStompDetected`, `startTracking`, `stopTracking`, `isTracking`, `sensitivity`.
- [ ] Define `OnsetDetectionCallback` interface in `types.ts` with `reportOnset`, `getSessionOnsets`, `clearSessionOnsets`.
- [ ] Create no-op default implementations for each interface:
  - `defaultMicInputHook`: all methods are no-ops, `isListening` is always false.
  - `defaultAccelerometerHook`: all methods are no-ops, `isTracking` is always false, `sensitivity` is 0.5.
  - `defaultOnsetDetectionCallback`: `reportOnset` is a no-op, `getSessionOnsets` returns empty array, `clearSessionOnsets` is a no-op.
- [ ] Export a registration mechanism so P1 features can replace the no-op implementations:
  ```typescript
  function registerMicInput(hook: MicInputHook): void;
  function registerAccelerometer(hook: AccelerometerHook): void;
  function registerOnsetDetection(callback: OnsetDetectionCallback): void;
  ```
- [ ] Export the no-op defaults from `index.ts` for use in tests.

**Acceptance Criteria:**
- All three interfaces are importable from `@/foundations/audio-engine`.
- The no-op implementations can be instantiated and called without errors.
- Calling `registerMicInput(customHook)` replaces the default, and subsequent audio engine references to the mic hook use the custom implementation.
- Extension points do not affect the audio engine's behavior when using default no-op implementations.

---

## Task 10A: Source/Create Audio Assets

- [ ] Create or source royalty-free WAV files for all SoundId values
- [ ] MVP sounds: click, clave, woodblock
- [ ] Baby sounds: soft-chime, soft-bell
- [ ] Validate: 44.1kHz, 16-bit, mono, < 200ms, clean attack
- [ ] Place in `assets/sounds/`
- [ ] Estimate: 2-4 hours

---

## Task 10B: Audio Session Configuration

- [ ] Configure iOS AVAudioSession category (.playback)
- [ ] Configure Android audio focus handling
- [ ] Handle Bluetooth connect/disconnect
- [ ] Handle audio interruptions (phone calls, Siri)
- [ ] Test: audio pauses on call, resumes on user action
- [ ] Estimate: 1 day

---

## Task 10C: Stereo Split Platform Validation

- [ ] Test expo-av pan control on iOS device
- [ ] Test expo-av pan control on Android device
- [ ] Document results and fallback approach if pan unavailable
- [ ] Estimate: 2-4 hours

---

## Task 11: Unit Tests for Scheduler, Tap Tempo, Fade Curves

- [ ] **Scheduler tests** (`__tests__/scheduler.test.ts`):
  - Test 3:2 at 120 BPM: verify 5 events, correct timestamps (0, 500, 1000, 1500, 2000 for layer division).
  - Test 4:3 at 60 BPM: verify 7 events, correct cycle duration.
  - Test 2:1 (simplest): verify 3 events.
  - Test coincident beats: verify beat 1 has events for both layers at time 0.
  - Test edge case: 1:1 (unison) — should produce 2 events at time 0 (both on the same beat), though this is a degenerate case.
  - Test invalid input: negative ratio throws error, zero BPM throws error.

- [ ] **Tap tempo tests** (`__tests__/tempoEngine.test.ts`):
  - Mock `Date.now()` to control timestamps.
  - 4 taps at 500ms intervals -> BPM ~120.
  - 4 taps at 1000ms intervals -> BPM ~60.
  - Tap after 3-second gap resets buffer.
  - Single tap returns null/undefined (not enough data).
  - Wildly irregular taps produce a reasonable average.

- [ ] **Fade curve tests** (`__tests__/volumeControl.test.ts`):
  - Fade from 0.8 to 0.0 over 4 bars with 3 beats per bar: 12 steps, each reducing by 0.8/12.
  - Fade interrupted by new fade: verify old fade is cancelled, new fade starts from current volume.
  - Fade interrupted by direct `setVolume`: verify fade is cancelled.
  - Mute and unmute round-trip preserves original volume.

**Acceptance Criteria:**
- All tests pass with `jest` or the project's configured test runner.
- Scheduler tests verify exact millisecond timestamps (within floating point tolerance).
- Tap tempo tests use mocked time and are deterministic.
- No tests depend on actual audio playback.

---

## Task 12: Integration Test — Play 3:2 and Verify Timing

- [ ] Write an integration test (`__tests__/integration/playback.test.ts`) that:
  1. Calls `preloadSounds()` (mock `expo-av` so no actual audio loads).
  2. Sets ratio to 3:2, BPM to 120.
  3. Registers an `onBeat` callback that records all `(layer, beatIndex, timestamp)` tuples.
  4. Calls `play()`.
  5. Advances time (using jest fake timers) through 2 full cycles (6000ms at 120 BPM 3:2).
  6. Calls `stop()`.
  7. Asserts:
     - 10 total beat callbacks fired (5 per cycle x 2 cycles).
     - `onCycleComplete` fired exactly 2 times.
     - Beat timestamps match expected schedule within 5ms tolerance.
     - `cycleCount` is 2 after 2 cycles, 0 after `stop()`.

- [ ] Write a second integration test for pause/resume:
  1. Play for 1.5 cycles, then `pause()`.
  2. Verify `isPlaying` is false and `isPaused` is true.
  3. Call `play()` to resume.
  4. Advance through the remaining 0.5 cycles.
  5. Verify the total beat callbacks match a full 2-cycle run (no duplicates, no missed beats).

**Acceptance Criteria:**
- Both integration tests pass with mocked audio and fake timers.
- Timing assertions use a 5ms tolerance to account for setTimeout resolution.
- Tests are self-contained — no real audio hardware required.
- Tests clean up after themselves (stop playback, unsubscribe callbacks, unload sounds).

---

## Task Dependencies

- Task 0 (spike) → blocks ALL other tasks
- Task 1 (types) → no dependencies
- Task 2 (scheduler) → depends on Task 1
- Task 3 (sound loader) → depends on Task 1, Task 10A (audio assets)
- Task 7 (transport) → depends on Tasks 2, 3, 4, 5, 6
- Task 8 (store) → depends on Task 7
- Task 10A (audio assets) → no dependencies (can run in parallel with Task 1)
- Task 10B (audio session) → depends on Task 3
- Task 10C (stereo validation) → depends on Task 4
- Integration tests → depend on all above
