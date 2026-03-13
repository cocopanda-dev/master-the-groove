# Disappearing Beat Mode — Feature Spec

Trains internal pulse by progressively muting layers. This is one of the most powerful training features in GrooveCore — it targets the exact skill that separates musicians with genuine feel from those who can only follow a pattern. By removing the external reference, the user is forced to hold the rhythm internally.

---

## Entry Points

1. **Practice tab -> Disappearing Beat button** — opens the configuration screen, then launches the mode
2. **Feel Lessons step 7 (inline launch)** — pre-configured, no configuration screen, runs embedded within the lesson flow

---

## Configuration Screen (Practice tab entry only)

Displayed when launched from the Practice tab. Skipped when launched inline from Feel Lessons.

### Options

| Setting | Options | Default | Description |
|---|---|---|---|
| Polyrhythm | 3:2, 4:3 | 3:2 | Which polyrhythm to practice |
| Disappearing layer | A or B | A | Which layer progressively mutes |
| Bars per stage | 4, 8, 16 | 8 | How many bars each stage lasts before transitioning |
| Return cycles | 1, 2, 3 | 2 | How many complete cycles play at full volume after the mute phase before the mode ends |

### UI
- Each setting is a labeled row with a segmented control or picker
- "Start" button at the bottom launches playback with the selected configuration
- BPM and sounds inherit from the Core Player's last-used settings (via `settingsStore`), or default to 72 BPM / Click + Clave
- A small "BPM" adjuster is available on this screen to override if desired

---

## Stage Engine

The mode progresses through a fixed sequence of stages. All stage transitions happen at **cycle boundaries** (beat 1 of the next cycle) to maintain musical coherence.

### Stage Sequence

| Stage | Target Layer Volume | Other Layer Volume | Description |
|---|---|---|---|
| Stage 0 | 100% | 100% | Warm-up — both layers at full volume. User gets comfortable with the pattern. |
| Stage 1 | 50% | 100% | Target layer fades to 50% over 2 bars using `audioStore.fadeLayer()`. User starts to fill in the gap mentally. |
| Stage 2 | 0% | 100% | Target layer fades to 0% over 2 bars. User must hold the target layer entirely internally while hearing the other. |
| Stage 3 | 0% | 0% | Both layers mute. User holds BOTH layers internally — pure internal pulse. |
| Return | 100% | 100% | Both layers snap back to full volume at beat 1 of the next cycle. Plays for the configured number of return cycles. |

### Stage Timing
- Each stage lasts the configured number of **bars** (not cycles). For 3:2 at one bar = one combined cycle, bars and cycles are equivalent.
- Fade transitions happen over the first 2 bars of each fade stage (Stage 1 and Stage 2). The remaining bars of that stage play at the target volume.
- Stage transitions are triggered by the audio scheduler's cycle-boundary callback.

### Stage Progression Logic
```
1. Start -> Stage 0 (bars_per_stage bars)
2. Stage 0 complete -> Stage 1 (bars_per_stage bars, fade in first 2)
3. Stage 1 complete -> Stage 2 (bars_per_stage bars, fade in first 2)
4. Stage 2 complete -> Stage 3 (bars_per_stage bars)
5. Stage 3 complete -> Return (return_cycles complete cycles at full volume)
6. Return complete -> Mode ends, show results
```

---

## Drift Feedback

### During Stage 3 (Both Muted)
- A large, prominent tap target appears center-screen: **"Tap on beat 1 when you feel it"**
- Tap target: circular, min 80px diameter, accent color, pulses subtly to invite tapping
- Each tap records a timestamp
- Multiple taps allowed (user taps on each perceived beat 1)
- The audio scheduler continues running silently, tracking where beat 1 actually falls

### On Return
When layers snap back at the return phase:
- Compare the user's **last tap timestamp before the return** to the actual beat 1 timestamp
- Calculate drift: `userTap - actualBeat1` in milliseconds
  - Negative = early
  - Positive = late

### Drift Display
- **Arrow indicator** showing drift direction:
  - Left arrow = early
  - Right arrow = late
  - Center dot = locked in
- **Magnitude text** (e.g., "-45ms" or "+120ms")
- **Zone classification:**
  - **"Locked in"** (within 50ms): green color, celebratory micro-animation
  - **"Close"** (50–150ms): yellow/amber color, encouraging text
  - **"Drifting"** (>150ms): orange color, neutral text (no judgment — purely informational)
- **No pass/fail** — the display is informational and encouraging regardless of result
- Drift display persists on the results screen after the mode ends

---

## UI During Playback

### Radial Visualizer
- The same `RadialVisualizer` component from Core Player, but with stage-aware rendering:
  - **Stage 0:** All dots visible and animating normally
  - **Stage 1:** Target layer dots at 50% opacity (matching audio fade)
  - **Stage 2:** Target layer dots fully hidden or ghosted (very faint outline)
  - **Stage 3:** All dots hidden or ghosted. Circle outline remains visible as spatial reference.
  - **Return:** All dots snap back to full visibility

### Stage Indicator
- Displayed above or below the visualizer
- Text: "Stage 1 of 3" (stages 1–3 are the active challenge; stage 0 is "Warm-up", return is "Return")
- Progress bar or step dots showing progression through stages
- Current stage label: "Fading...", "Hold it!", "Both silent — feel it!", "Welcome back!"

### Volume Indicators
- Small visual bars or meters showing current volume of each layer
- Animate in sync with fade transitions
- Helps user see what's happening to the audio

### Tap Target (Stage 3 only)
- Large circular button, center-screen, overlaying or below the visualizer
- Label: "Tap beat 1"
- Pulses gently (opacity or scale) to invite interaction
- On tap: brief flash/pulse animation as acknowledgment
- Hidden during stages 0–2 and return

---

## Results Screen

Displayed after the return phase completes:

- **Drift feedback** (arrow, magnitude, zone) as described above
- **Session summary:**
  - Polyrhythm practiced
  - BPM
  - Configuration (which layer disappeared, bars per stage)
  - Time spent
- **Actions:**
  - "Try Again" — restarts with same configuration
  - "Adjust Settings" — returns to configuration screen
  - "Back to Practice" — returns to Practice tab
- When launched from Feel Lessons: results display briefly, then a "Continue Lesson" button appears to return to the lesson flow

---

## State

### Consumed
- `audioStore` — playback control, layer volumes, fade functions, cycle-boundary events, beat timing data

### Written
- `sessionStore` — logs a disappearing beat session:
  ```
  {
    type: 'disappearing-beat',
    polyrhythmId: string,
    bpm: number,
    disappearingLayer: 'A' | 'B',
    barsPerStage: number,
    returnCycles: number,
    driftMs: number | null,       // null if user didn't tap
    driftZone: 'locked' | 'close' | 'drifting' | null,
    duration: number,             // seconds
    timestamp: string
  }
  ```

---

## Audio Engine Requirements

The Disappearing Beat mode requires the following from the audio engine / `audioStore`:

- `fadeLayer(layer: 'A' | 'B', targetVolume: number, durationBars: number)` — smoothly transitions a layer's volume over the specified number of bars
- `onCycleComplete(callback)` — fires at beat 1 of each new cycle, providing the cycle count and timestamp. Used for stage transitions.
- `getCurrentBeat1Timestamp()` — returns the precise ms timestamp of the most recent beat 1 (for drift calculation)
- `muteAll()` / `unmuteAll()` — instant mute/unmute of both layers simultaneously (stores/restores pre-mute volumes)
- The scheduler must continue running during mute phases (Stage 3) so that beat 1 timestamps remain accurate even when no audio is produced

---

## Edge Cases

- **User doesn't tap during Stage 3:** drift feedback shows "No tap detected" instead of arrow/magnitude. Still shows session summary.
- **Very short bars_per_stage (4 bars):** fades happen over 2 of the 4 bars, leaving only 2 bars at target volume. This is intentional — shorter stages are harder.
- **Very slow BPM:** stages last longer in wall-clock time. No timeout — user controls the experience.
- **App backgrounding during a session:** pause the session, resume when foregrounded. Do not auto-advance stages in background.
- **Inline launch from lessons:** configuration is fixed (no config screen), results display is abbreviated (drift feedback only, no "Adjust Settings" option).
