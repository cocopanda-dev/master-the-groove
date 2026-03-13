# Core Player — Feature Spec

The main polyrhythm player screen, accessible from the Practice tab. This is the foundation of GrooveCore — a precise, clean polyrhythm player that does the basics better than competitors, with stereo split as the key differentiator.

---

## Screen Layout

### Top Section: Ratio Selector
- Horizontal pill selector displaying available polyrhythm ratios
- MVP ratios: **3:2** and **4:3**
- Each pill shows the ratio as text (e.g., "3:2")
- Active pill uses primary accent color with white text; inactive pills use muted background
- Tapping a new ratio while playing: stops playback, reconfigures the scheduler, resets visualizer — user must press play again
- Post-MVP ratios (2:3, 5:4, etc.) render as locked/grayed pills with "Coming Soon" label

### Center Section: Radial Visualizer
- Circular beat indicator occupying the central ~60% of the screen
- Full circle = one combined cycle (LCM of A and B beats)
- **Layer A dots:** positioned evenly around the circle at their subdivision points, colored with `tokens.color.layerA` (e.g., coral/orange)
- **Layer B dots:** positioned evenly around the circle at their subdivision points, colored with `tokens.color.layerB` (e.g., teal/blue)
- **Beat 1 (shared downbeat):** accent color (`tokens.color.accent`), rendered as a larger dot (1.5x radius of regular dots), positioned at 12 o'clock
- **Active beat animation:** when a beat fires, its dot scales up to 1.3x over 80ms then returns to 1.0x over 120ms (ease-out)
- **Rotation indicator:** a subtle line or gradient arc that rotates smoothly around the circle showing current position in the cycle, driven by the audio scheduler's clock
- **Breathing animation:** the entire circle subtly scales between 0.98x and 1.02x on each full cycle, creating an organic "breathing" feel
- **Technology:** `react-native-skia` for drawing the circle, dots, and rotation indicator; `react-native-reanimated` for all animations targeting 60fps on UI thread

### Below Visualizer: BPM Controls
- **BPM display:** large numeric readout of current BPM (e.g., "72 BPM"), tappable to open a numeric input modal for precise entry
- **BPM slider:** horizontal slider, range **40–160 BPM** (MVP), continuous, updates live while playing — the audio engine handles smooth tempo transitions without audible glitches
- **Tap tempo button:** icon button (metronome icon or "TAP" label)
  - User taps 4+ times; BPM calculated from average interval of last 4–8 taps
  - Taps older than 3 seconds are discarded (resets the sequence)
  - Visual feedback: button pulses on each tap
  - After 4+ taps with consistent interval, BPM updates immediately

### Sound Selectors
- One dropdown per layer (Layer A, Layer B)
- MVP sounds: **Click**, **Clave**, **Woodblock**
- Each dropdown shows the sound name with a small speaker icon; tapping opens a bottom sheet with sound options and a preview button (plays a single hit)
- Sound change takes effect at the **start of the next cycle** (not mid-cycle) to avoid jarring transitions
- Default: Layer A = Click, Layer B = Clave

### Volume Sliders
- One horizontal slider per layer, labeled "Layer A" / "Layer B" with the layer color
- Range: 0% to 100%, default 80%
- Volume change is **immediate** (no waiting for cycle boundary)
- Mute icon at left end; tapping it toggles mute for that layer
- Visual: slider track fill uses the respective layer color

### Stereo Split Toggle
- Headphone icon button, toggleable
- **Off (default):** both layers play in both ears (center-panned)
- **On:** Layer A pans fully left, Layer B pans fully right
- **First-use tooltip:** on the very first activation, display a tooltip/coach mark: "Left ear = rhythm A, Right ear = rhythm B. Use headphones for the best experience." Tooltip is dismissible and never shows again (tracked in `settingsStore.hasSeenStereoTooltip`)
- When toggled on, icon fills with accent color; when off, icon is outlined/gray
- State persisted in `audioStore.stereoSplit`

### Bottom Section: Transport Controls
- **Play/Pause button:** large, centered, circular button (~64px)
  - Play state: shows pause icon, accent background
  - Paused state: shows play icon, muted background
  - Toggles `audioStore.play()` / `audioStore.pause()`
- **Stop button:** smaller circular button to the left of play/pause
  - Resets playback to the beginning of the cycle
  - Calls `audioStore.stop()` — resets `currentBeatA` and `currentBeatB` to 0, stops audio
- Screen stays awake during playback (`expo-keep-awake`)

---

## Interactions Summary

| Action | Behavior |
|---|---|
| Play/Pause | Toggles `audioStore.play()` / `audioStore.pause()` |
| Stop | Resets to cycle beginning, stops audio |
| Ratio change | Stops playback, reconfigures scheduler, user presses play to restart |
| BPM slider drag | Live update while playing; audio engine interpolates smoothly |
| Tap tempo | 4+ taps updates BPM from averaged interval |
| Sound change | Takes effect on next cycle start |
| Volume change | Immediate |
| Stereo split toggle | Immediate pan change |

---

## State

### Consumed from `audioStore`
- `isPlaying: boolean`
- `bpm: number`
- `ratioA: number` (numerator, e.g., 3)
- `ratioB: number` (denominator, e.g., 2)
- `soundA: SoundType` (click | clave | woodblock)
- `soundB: SoundType`
- `volumeA: number` (0–1)
- `volumeB: number` (0–1)
- `stereoSplit: boolean`
- `currentBeatA: number` (0-indexed, which beat of layer A is active)
- `currentBeatB: number` (0-indexed, which beat of layer B is active)

### Written to `settingsStore`
- Last used settings for session restore on next app launch:
  - `lastRatioA`, `lastRatioB`
  - `lastBpm`
  - `lastSoundA`, `lastSoundB`
  - `lastVolumeA`, `lastVolumeB`
  - `lastStereoSplit`
  - `hasSeenStereoTooltip`

---

## Session Restore

On app launch, if `settingsStore` has saved player settings:
- Restore BPM, ratio, sounds, volumes, stereo split to `audioStore`
- Do NOT auto-play — user must press play
- If stored ratio is no longer available (edge case for future ratio removal), fall back to 3:2

---

## Extension Points

### Visualization Mode Picker (P1 stub)
- Reserve a small icon/button slot near the visualizer (e.g., top-right of the visualizer area)
- Tapping it at MVP shows a tooltip: "More visualization modes coming soon"
- P1: opens a picker to switch between Radial View and Composite Shape Visualizer

### Mode Picker (P1 stub)
- Reserve a segmented control or tab strip above the transport controls
- MVP: shows only "Free Play" as active
- P1: adds "Disappearing Beat" and "Body Layer" as switchable modes from this screen, avoiding full navigation away

---

## Edge Cases

- **No headphones + stereo split:** stereo split still applies to device speakers, but the effect is minimal. Consider showing a "Connect headphones for the best experience" hint.
- **Background audio:** when app goes to background, audio continues playing. Returning to foreground re-syncs the visualizer to the audio clock.
- **Very slow BPM (40):** cycle duration is long; visualizer rotation should remain smooth. Ensure animation driver uses clock time, not frame counting.
- **Very fast BPM (160):** dots fire rapidly; ensure beat animations don't overlap. Use `cancelAnimation` on the previous beat's scale animation if a new beat fires before it completes.

---

## Accessibility

- All controls reachable via VoiceOver / TalkBack
- BPM value announced on slider change
- Play/Pause state announced
- Visualizer has `accessibilityLabel` describing current beat pattern
- Minimum tap target: 44px for all interactive elements
