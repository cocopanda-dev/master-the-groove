# Disappearing Beat Mode — Implementation Tasks

Feature: Disappearing Beat Mode
Spec: `development/features/disappearing-beat/spec.md`
Priority: P0 (MVP)

---

## 1. Configuration Screen

- [ ] **Task 1.1: Create DisappearingBeatConfigScreen**
  - Route: accessible from Practice tab via a "Disappearing Beat" button
  - Four configuration rows, each with a segmented control or picker:
    - Polyrhythm: 3:2, 4:3
    - Disappearing layer: A, B
    - Bars per stage: 4, 8, 16
    - Return cycles: 1, 2, 3
  - BPM adjuster (small slider or stepper) — defaults to `settingsStore.lastBpm` or 72
  - "Start" button at the bottom
  - **AC:** All settings are selectable. "Start" navigates to the playback screen with the selected configuration.

- [ ] **Task 1.2: Wire configuration to launch parameters**
  - On "Start": create a configuration object `{ polyrhythmId, disappearingLayer, barsPerStage, returnCycles, bpm }` and pass to the playback screen/component
  - When launched inline from Feel Lessons: accept a pre-built configuration object directly, skip the config screen entirely
  - **AC:** Playback screen receives correct configuration from both entry points.

---

## 2. Stage Engine

- [ ] **Task 2.1: Build DisappearingBeatEngine hook/class**
  - Manages the state machine: Stage 0 -> Stage 1 -> Stage 2 -> Stage 3 -> Return -> Complete
  - Exposes: `currentStage`, `stageLabel`, `barsRemainingInStage`, `isComplete`, `isTapPhase`
  - Listens to `audioStore.onCycleBoundary()` to count bars and trigger stage transitions
  - Stage transitions only fire at cycle boundaries (beat 1)
  - **AC:** Engine progresses through all stages at the correct bar counts. Unit tests verify stage transitions, bar counting, and completion detection.

- [ ] **Task 2.2: Implement volume fade logic**
  - Stage 0 -> Stage 1 transition: call `audioStore.fadeLayer(targetLayer, 0.5, 2)` (fade to 50% over 2 bars)
  - Stage 1 -> Stage 2 transition: call `audioStore.fadeLayer(targetLayer, 0.0, 2)` (fade to 0% over 2 bars)
  - Stage 2 -> Stage 3 transition: call `audioStore.muteAll()` (instant mute of remaining layer)
  - Stage 3 -> Return transition: call `audioStore.unmuteAll()` and set both layers to 100% (snap back at beat 1)
  - **AC:** Volume transitions are audibly smooth during fades and instantaneous during snap-back. Fades take exactly 2 bars.

- [ ] **Task 2.3: Ensure audio scheduler runs during silence**
  - Verify that `audioStore`'s internal scheduler continues ticking during Stage 3 (both layers muted)
  - Beat 1 timestamps must remain accurate even when no audio is produced
  - `onCycleBoundary` must continue firing
  - **AC:** After Stage 3 return, layers re-enter perfectly on beat 1. `getCurrentBeat1Timestamp()` returns accurate values during silence.

---

## 3. Drift Detection

- [ ] **Task 3.1: Implement tap target and timestamp recording**
  - During Stage 3 (`isTapPhase === true`): render a large tap target (80px+ diameter, accent color, centered)
  - Label: "Tap beat 1"
  - On each tap: record `Date.now()` (or high-resolution timestamp if available) into an array
  - Tap visual feedback: brief flash/scale pulse on tap
  - **AC:** Tap target appears only during Stage 3. Taps are recorded with timestamps. Visual feedback fires on each tap.

- [ ] **Task 3.2: Calculate drift on return**
  - When Stage 3 -> Return transition fires:
    - Get `actualBeat1` timestamp from `audioStore.getCurrentBeat1Timestamp()`
    - Get `lastUserTap` from the recorded tap array (most recent tap before the return)
    - Calculate `drift = lastUserTap - actualBeat1` in milliseconds
  - Classify drift:
    - `|drift| <= 50ms` -> "locked" (green)
    - `50ms < |drift| <= 150ms` -> "close" (amber)
    - `|drift| > 150ms` -> "drifting" (orange)
  - If no taps recorded: drift = null, zone = null
  - **AC:** Drift calculation is correct for early taps (negative), late taps (positive), and no taps (null). Zone classification matches spec thresholds.

- [ ] **Task 3.3: Build DriftFeedback display component**
  - Props: `driftMs: number | null`, `zone: 'locked' | 'close' | 'drifting' | null`
  - Renders:
    - Arrow pointing left (early), right (late), or center dot (locked in)
    - Magnitude text: "-45ms", "+120ms", or "Locked in!"
    - Zone label with color coding (green/amber/orange)
    - If null: "No tap detected" message
  - Micro-animation on "locked in" (subtle celebratory pulse)
  - **AC:** Component renders correctly for all drift values and zones. Null case handled gracefully.

---

## 4. Playback UI

- [ ] **Task 4.1: Build DisappearingBeatPlaybackScreen**
  - Renders: RadialVisualizer, stage indicator, volume indicators, tap target (stage 3), transport controls
  - Receives configuration from config screen or inline launch
  - On mount: configures `audioStore` with selected polyrhythm, BPM, and sounds, then starts the engine
  - On unmount: stops playback, cleans up engine
  - **AC:** Screen renders all elements correctly. Playback starts and progresses through stages.

- [ ] **Task 4.2: Implement stage-aware visualizer rendering**
  - Pass a `stageOpacity` map to `RadialVisualizer`:
    - Stage 0: Layer A opacity 1.0, Layer B opacity 1.0
    - Stage 1: Target layer opacity 0.5, other layer 1.0
    - Stage 2: Target layer opacity 0.0 (or 0.1 for ghost), other layer 1.0
    - Stage 3: Both layers opacity 0.0 (or 0.1 for ghosts). Circle outline remains at 1.0
    - Return: Both layers opacity 1.0
  - Opacity transitions should animate smoothly in sync with audio fades
  - **AC:** Dot visibility matches audio volume at each stage. Ghost dots (if used) are barely visible but provide spatial reference.

- [ ] **Task 4.3: Build stage indicator component**
  - Displays current stage: "Warm-up", "Stage 1 of 3", "Stage 2 of 3", "Stage 3 of 3 — Hold it!", "Return"
  - Progress dots or mini progress bar below the label
  - Descriptive sub-label: "Fading...", "Hold both layers!", "Both silent — feel the beat!", "Welcome back!"
  - **AC:** Stage indicator updates at each stage transition with correct labels and progress.

- [ ] **Task 4.4: Build volume indicator component**
  - Two small horizontal bars or meters, one per layer, labeled with layer colors
  - Animate fill/opacity to match current layer volumes
  - Updates in real-time during fade transitions
  - **AC:** Volume indicators visually reflect the current volume of each layer at all times.

---

## 5. Results Screen

- [ ] **Task 5.1: Build DisappearingBeatResultsScreen**
  - Displayed after return phase completes
  - Content:
    - `DriftFeedback` component (from task 3.3)
    - Session summary: polyrhythm, BPM, configuration, duration
    - Action buttons: "Try Again", "Adjust Settings", "Back to Practice"
  - "Try Again": restarts with same config
  - "Adjust Settings": navigates back to config screen with current settings pre-filled
  - "Back to Practice": navigates to Practice tab
  - **AC:** Results screen shows correct drift feedback and session data. All navigation buttons work.

- [ ] **Task 5.2: Implement inline results for Feel Lessons**
  - When launched from lessons: results display is abbreviated
  - Show drift feedback only (no session summary)
  - After 3 seconds (or on tap): show "Continue Lesson" button
  - "Continue Lesson" calls the lesson engine's step completion callback
  - No "Adjust Settings" or "Back to Practice" buttons in inline mode
  - **AC:** Inline launch shows drift briefly, then allows returning to the lesson flow.

---

## 6. Session Logging

- [ ] **Task 6.1: Log disappearing beat session to sessionStore**
  - On mode completion (after results screen renders), write a session record:
    - `type: 'disappearing-beat'`
    - `polyrhythmId`, `bpm`, `disappearingLayer`, `barsPerStage`, `returnCycles`
    - `driftMs`, `driftZone`
    - `duration` (seconds, from start to completion)
    - `timestamp` (ISO string)
  - **AC:** Session record appears in `sessionStore` after completion. Data is accurate and persists across app restarts.

---

## 7. Embeddable Component for Lessons

- [ ] **Task 7.1: Create DisappearingBeatInline component**
  - A self-contained component that can be rendered inside another screen (e.g., LessonScreen)
  - Props: `config: DisappearingBeatConfig`, `onComplete: (result: { driftMs, driftZone }) => void`
  - Manages its own engine instance, playback, and tap detection
  - On completion: calls `onComplete` with drift data, does NOT navigate
  - **AC:** Component runs the full disappearing beat flow embedded within a parent screen. Parent receives completion callback with drift data.

---

## Dependency Notes

- Tasks 2.1–2.3 depend on `audioStore` providing `fadeLayer()`, `muteAll()`, `unmuteAll()`, `onCycleBoundary()`, and `getCurrentBeat1Timestamp()`. If these don't exist yet, they must be built as part of the audio engine work.
- Task 4.2 depends on `RadialVisualizer` supporting per-layer opacity props.
- Task 7.1 is required by Feel Lessons task 3.7 (DisappearingStep component).
