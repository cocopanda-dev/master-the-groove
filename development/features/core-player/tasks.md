# Core Player — Implementation Tasks

Feature: Core Polyrhythm Player
Spec: `development/features/core-player/spec.md`
Priority: P0 (MVP)

---

## 1. Screen Shell & Layout

- [ ] **Task 1.1: Create CorePlayerScreen component**
  - File: `app/(tabs)/practice/index.tsx` (or dedicated screen file)
  - Scaffold the screen with placeholder sections: ratio selector area, visualizer area, BPM controls area, sound selectors area, volume sliders area, stereo toggle area, transport controls area
  - Use `SafeAreaView` and `ScrollView` (or fixed layout if content fits without scroll)
  - **AC:** Screen renders with labeled placeholder boxes for each section. Navigation from Practice tab lands here.

- [ ] **Task 1.2: Implement screen-awake behavior**
  - Install/configure `expo-keep-awake`
  - Activate keep-awake when `audioStore.isPlaying` is true; deactivate on pause/stop or unmount
  - **AC:** Device screen does not dim or lock while audio is playing. Screen lock resumes when playback stops.

---

## 2. Ratio Selector

- [ ] **Task 2.1: Build RatioSelector pill component**
  - Horizontal row of pill-shaped buttons
  - Props: `ratios: Array<{a: number, b: number}>`, `selected: {a, b}`, `onSelect: (a, b) => void`
  - Active pill styled with accent color and white text; inactive pills muted
  - MVP data: `[{a:3, b:2}, {a:4, b:3}]`
  - **AC:** Tapping a pill calls `onSelect` with the correct ratio. Visual state reflects selection.

- [ ] **Task 2.2: Wire ratio selector to audioStore**
  - On ratio change: call `audioStore.stop()`, set new `ratioA`/`ratioB`, reset `currentBeatA`/`currentBeatB` to 0
  - User must press play again after ratio change
  - **AC:** Changing ratio while playing stops playback. Pressing play after change plays the new ratio correctly.

---

## 3. Radial Visualizer

- [ ] **Task 3.1: Set up Skia canvas for visualizer**
  - Install/configure `@shopify/react-native-skia`
  - Create `RadialVisualizer` component with a `Canvas` element sized to fill its container (square, centered)
  - Draw the base circle (thin stroke, neutral color)
  - **AC:** A circle renders centered in the visualizer area at the correct size.

- [ ] **Task 3.2a: Position calculation utility**
  - Compute angular positions from LCM-based beat counts
  - For Layer A, place `ratioA` dots evenly spaced around the circle; same for Layer B with `ratioB` dots
  - Positions should recalculate when ratio changes
  - **AC:** Utility returns correct angular positions for any ratio combination.

- [ ] **Task 3.2b: Skia dot rendering**
  - Draw dots at calculated positions with `tokens.color.layerA` / `tokens.color.layerB` colors
  - **AC:** For 3:2, 3 Layer-A dots and 2 Layer-B dots render at correct angular positions.

- [ ] **Task 3.2c: Beat 1 accent styling**
  - Beat 1 (position 0, 12 o'clock) is shared — render it larger (1.5x radius) with `tokens.color.beatOne` color
  - Pulse animation on beat 1
  - **AC:** Beat 1 dot is visually distinct: larger size, beatOne color, pulses on beat 1 fire.

- [ ] **Task 3.3: Implement beat pulse animation**
  - Use `react-native-reanimated` shared values to drive dot scale
  - When `currentBeatA` or `currentBeatB` changes, the corresponding dot scales to 1.3x over 80ms then returns to 1.0x over 70ms (ease-out). Total: 150ms (matching `beatPulseDuration` token)
  - Cancel any in-progress animation on that dot before starting a new one (handles fast BPM)
  - **AC:** Dots visibly pulse when their beat fires. At 160 BPM, animations do not stack or cause jank.

- [ ] **Task 3.4: Implement rotation indicator**
  - A subtle arc, line, or gradient that rotates around the circle showing the current position in the cycle
  - Driven by a shared value synced to `audioStore`'s playback clock (normalized 0–1 through the cycle)
  - Smooth continuous rotation at 60fps using `useAnimatedStyle` or Skia animation
  - Stops (and optionally resets to 12 o'clock) when playback stops
  - **AC:** During playback, a visual indicator sweeps around the circle in sync with the audio. No visible stutter.

- [ ] **Task 3.5: Implement breathing animation**
  - The entire visualizer circle subtly scales between 0.98x and 1.02x over each full cycle
  - Driven by the same playback clock as the rotation indicator
  - Smooth sinusoidal interpolation
  - **AC:** Visualizer has a gentle "breathing" feel during playback. Effect is subtle, not distracting.

---

## 4. BPM Controls

- [ ] **Task 4.1: Build BPM display and slider**
  - Large numeric BPM readout (e.g., "72 BPM")
  - Horizontal slider below, range 40–160, step 1
  - Slider value bound to `audioStore.bpm` — changes update the store immediately
  - Tapping the numeric readout opens a modal/bottom sheet with a numeric input for precise BPM entry (validate range 40–160)
  - **AC:** Dragging the slider updates BPM in real time. Typing a value in the modal sets BPM precisely. Audio tempo changes live during playback.

- [ ] **Task 4.2: Implement tap tempo**
  - Tap tempo button with "TAP" label or metronome icon
  - Track timestamps of taps; discard taps older than 3 seconds
  - After 4+ valid taps, calculate BPM from average interval of the last 4–8 taps
  - Update `audioStore.bpm` with the calculated value
  - Button pulses (scale animation) on each tap as feedback
  - **AC:** Tapping at a steady rate correctly calculates and sets BPM. Pausing longer than 3 seconds resets the tap sequence.

---

## 5. Sound Selectors

- [ ] **Task 5.1: Build sound selector dropdowns**
  - Two dropdown components, one per layer, labeled with layer color
  - Tapping opens a bottom sheet listing MVP sounds: Click, Clave, Woodblock
  - Each option has a preview button (small speaker icon) that plays a single hit of that sound
  - Selection writes to `audioStore.soundA` or `audioStore.soundB`
  - **AC:** User can select different sounds for each layer. Preview plays the correct sound sample. Selection persists.

- [ ] **Task 5.2: Implement next-cycle sound swap**
  - When a sound is changed during playback, the new sound does not take effect until beat 1 of the next cycle
  - Internally: store the "pending sound" and swap it in at the cycle boundary callback
  - **AC:** Changing sound mid-playback does not cause an abrupt switch. The new sound starts cleanly at the next cycle.

---

## 6. Volume Sliders

- [ ] **Task 6.1: Build per-layer volume sliders**
  - Two horizontal sliders, one per layer
  - Labeled "Layer A" / "Layer B" with respective layer color on the track fill
  - Range 0–100%, default 80%, mapped to `audioStore.volumeA` / `audioStore.volumeB` (0.0–1.0)
  - Mute icon at the left end of each slider; tapping toggles mute (sets volume to 0 or restores previous value)
  - Volume change is immediate (no cycle boundary delay)
  - **AC:** Dragging volume slider changes perceived loudness in real time. Mute toggle silences/restores the layer immediately.

---

## 7. Stereo Split Toggle

- [ ] **Task 7.1: Build stereo split toggle button**
  - Headphone icon button
  - Off state: outlined/gray icon; On state: filled accent-color icon
  - Toggles `audioStore.stereoSplit`
  - Audio panning updates immediately: On = Layer A full left, Layer B full right; Off = both center
  - **AC:** Toggling stereo split while playing immediately changes the stereo field. Icon reflects current state.

- [ ] **Task 7.2: Implement first-use stereo tooltip**
  - On first activation of stereo split, show a coach mark / tooltip near the button
  - Text: "Left ear = rhythm A, Right ear = rhythm B. Use headphones for the best experience."
  - Dismissible via tap or "Got it" button
  - Set `settingsStore.hasSeenStereoTooltip = true` on dismiss — never show again
  - **AC:** Tooltip appears on first toggle-on. After dismissal, it never appears again, even after app restart.

---

## 8. Transport Controls

- [ ] **Task 8.1: Build play/pause and stop buttons**
  - Play/Pause: large circular button (~64px), centered
    - Shows play icon when paused, pause icon when playing
    - Calls `audioStore.play()` / `audioStore.pause()`
  - Stop: smaller circular button to the left
    - Calls `audioStore.stop()` — stops audio, resets `currentBeatA`/`currentBeatB` to 0
  - Button styles: play/pause uses accent fill when playing, muted fill when paused; stop uses secondary color
  - **AC:** Play starts audio and visualizer. Pause freezes playback in place. Stop resets to beginning. All visual states update correctly.

---

## 9. Session Restore

- [ ] **Task 9.1: Persist and restore player settings**
  - On any setting change (BPM, ratio, sounds, volumes, stereo split), write current values to `settingsStore` (persisted via Zustand persist middleware or AsyncStorage)
  - On `CorePlayerScreen` mount, if `settingsStore` has saved values, hydrate `audioStore` with them
  - Do NOT auto-play on restore
  - Fallback: if stored ratio is unavailable, default to 3:2
  - **AC:** Closing and reopening the app restores the last-used BPM, ratio, sounds, volumes, and stereo setting. Playback does not auto-start.

---

## 10. Extension Point Placeholders

- [ ] **Task 10.1: Add visualization mode picker stub**
  - Small icon button in the top-right corner of the visualizer area
  - Tapping shows a tooltip: "More visualization modes coming soon"
  - No functional behavior at MVP
  - **AC:** Button is visible and tappable. Tooltip renders and dismisses. No navigation or mode change occurs.

- [ ] **Task 10.2: Add mode picker stub**
  - Segmented control or tab strip above the transport controls area
  - MVP: single segment "Free Play" shown as active/selected
  - P1 segments (Disappearing Beat, Body Layer) are either hidden or shown as disabled/grayed
  - **AC:** "Free Play" segment is visible and selected. No other modes are selectable at MVP.

---

## 11. Accessibility & Polish

- [ ] **Task 11.1: Add accessibility labels and roles**
  - All interactive elements have `accessibilityLabel` and `accessibilityRole`
  - BPM slider announces value on change
  - Play/Pause announces current state
  - Ratio pills announce "selected" state
  - Visualizer canvas has a descriptive label (e.g., "Radial visualizer showing 3 over 2 polyrhythm")
  - Minimum tap target: 44px for all buttons
  - **AC:** Full VoiceOver/TalkBack pass — all controls are reachable and meaningfully labeled.

---

## 12. Session Recording

- [ ] **Task 12.1: Start Session on play()**
  - Create Session record with `startedAt`, `bpmStart`, `polyrhythmId`, `mode: 'free-play'`
  - **AC:** Calling play() creates a new Session record with correct initial fields.

- [ ] **Task 12.2: End Session on stop()/exit**
  - Set `endedAt`, `bpmEnd`, calculate `duration`
  - **AC:** Stopping playback or exiting the screen finalizes the Session with correct end fields.

- [ ] **Task 12.3: Feel-state prompt**
  - Show after sessions >= 30s with 3 options ('executing' | 'hearing' | 'feeling') + dismiss
  - **AC:** Prompt appears for 30s+ sessions; selecting an option stores it; dismissing sets `feelStateAfter: null`.

- [ ] **Task 12.4: Write Session to sessionStore**
  - Integrate with canonical Session type from `data-models.md`
  - Call `sessionStore.addSession()` with completed Session
  - **AC:** Completed sessions are persisted in sessionStore and retrievable.

- [ ] **Task 12.5: Discard sessions < 10s**
  - Sessions shorter than 10 seconds are not written to the store
  - **AC:** Rapid play/stop cycles do not create Session records.

---

## 13. Integration Tests

- [ ] **Task 13.1: Test audio-to-visual sync**
  - Beat pulse fires within tolerance of audio event
  - **AC:** Visual beat pulse timing matches audio scheduling within acceptable latency.

- [ ] **Task 13.2: Test session recording lifecycle**
  - Play -> stop -> session appears in store
  - **AC:** Full play/stop cycle creates a Session record with correct fields.

- [ ] **Task 13.3: Test ratio change during playback**
  - Audio restarts, session continues
  - **AC:** Changing ratio while playing stops audio, resets visualizer; existing session is finalized.

- [ ] **Task 13.4: Test feel-state prompt flow**
  - Appears for 30s+ sessions, records selection, handles dismissal
  - **AC:** Prompt flow works end-to-end including persistence.

---

## 14. Coming Soon Pills

- [ ] **Task 14.1: Render non-MVP ratios as grayed-out, non-selectable pills**
  - Show "Coming Soon" label on pill
  - Tap shows tooltip: "This ratio is coming in a future update."
  - **AC:** Non-MVP ratios are visible but not selectable; tooltip appears on tap.

---

## Prerequisites

- Audio engine foundation (`audio-engine/tasks.md`) must be COMPLETE before Tasks 3.x (visualizer/audio sync)
- Data layer foundation (`data-layer/tasks.md`) must be COMPLETE before Tasks 12.x (session recording)
- For UI-only tasks (1.x, 2.x), use a mock `audioStore` that returns static values

---

## Dependency Notes

- Tasks 3.1–3.5 (visualizer) depend on `audioStore` providing `currentBeatA`, `currentBeatB`, and a normalized playback clock value. Coordinate with the audio engine implementation.
- Task 5.2 (next-cycle sound swap) depends on the audio scheduler exposing a cycle-boundary callback or event.
- Task 9.1 (session restore) depends on `settingsStore` being set up with persistence middleware.
