# Design Tokens

Shared visual and audio constants used across the app. All agents building UI should reference this file.

---

## Color Palette

**WCAG 2.1 Contrast Requirements:** All text-on-background combinations must meet AA (4.5:1 for normal text, 3:1 for large text). Key verified pairs:
- `textPrimary` (#F8FAFC) on `surface` (#1C1830): Ratio ~14.2:1 -- AAA
- `textSecondary` (#94A3B8) on `surface` (#1C1830): Ratio ~6.5:1 -- AA
- `babyTextPrimary` (#1C1917) on `babyBackground` (#FFF7ED): Ratio ~16.1:1 -- AAA
- `babyTextSecondary` (#78716C) on `babyBackground` (#FFF7ED): Ratio ~4.6:1 -- AA

### Core Palette

| Token | Value | Usage |
|---|---|---|
| `primary` | `#3730A3` (deep indigo) | Headers, primary buttons, active tab |
| `primaryLight` | `#6366F1` | Hover/pressed states, secondary emphasis |
| `primaryDark` | `#1E1B4B` | Dark backgrounds, text on light surfaces |
| `secondary` | `#F97316` (warm coral/orange) | Accent actions, notifications, streaks |
| `secondaryLight` | `#FB923C` | Hover states |
| `accent` | `#EAB308` (golden) | Badges, achievements, feel-state "feeling" |
| `background` | `#0F0D1A` | App background (dark theme) |
| `surface` | `#1C1830` | Cards, modals, elevated surfaces |
| `surfaceLight` | `#2A2545` | Input fields, secondary cards |
| `textPrimary` | `#F8FAFC` | Main text |
| `textSecondary` | `#94A3B8` | Subdued text, labels |
| `textMuted` | `#64748B` | Disabled text, placeholders |
| `success` | `#22C55E` | Completion states, positive feedback |
| `warning` | `#FBBF24` | Caution states |
| `error` | `#EF4444` | System errors only (NOT used for drift feedback) |
| `border` | `#334155` | Dividers, card borders |

### Drift Feedback Colors

These colors are used in the Disappearing Beat mode to indicate timing drift. They intentionally avoid error-red to maintain the app's non-judgmental feel philosophy.

| Token | Value | Usage |
|---|---|---|
| `driftLockedIn` | `#22C55E` (green, same as `success`) | User is locked into the beat |
| `driftClose` | `#FBBF24` (amber, same as `warning`) | User is close but slightly off |
| `driftDrifting` | `#F97316` (warm orange, same as `secondary`) | User is drifting -- non-judgmental warmth, NOT error red |

### Layer Colors (Visualizer)

| Token | Value | Usage |
|---|---|---|
| `layerA` | `#818CF8` (soft indigo) | Layer A dots, tap zone A |
| `layerB` | `#FB923C` (warm orange) | Layer B dots, tap zone B |
| `beatOne` | `#EAB308` (golden) | Beat 1 shared marker, accent pulse |
| `layerAFaded` | `#818CF840` | Muted layer A -- used specifically in Disappearing Beat faded state to show the ghost of the removed layer |
| `layerBFaded` | `#FB923C40` | Muted layer B -- used specifically in Disappearing Beat faded state to show the ghost of the removed layer |

### Baby Mode Palette

| Token | Value | Usage |
|---|---|---|
| `babyBackground` | `#FFF7ED` (warm cream) | Baby mode background |
| `babySurface` | `#FFFFFF` | Baby mode cards |
| `babyPrimary` | `#F97316` (warm orange) | Baby mode primary actions |
| `babySecondary` | `#8B5CF6` (soft purple) | Baby mode secondary |
| `babyAccent` | `#EC4899` (pink) | Celebrations, burst animations |
| `babyTextPrimary` | `#1C1917` | Baby mode text (dark on light) |
| `babyTextSecondary` | `#78716C` | Baby mode subdued text |
| `babyTapZoneA` | `#3B82F6` (blue) | Parent tap zone |
| `babyTapZoneB` | `#F97316` (orange) | Baby/guided tap zone |
| `babyCelebration` | `#EAB308` (golden) | Burst animation on synced taps |

### Baby Visualizer Colors

High-contrast, warm-hue colors suitable for infant visual stimulation:

```typescript
babyVisualizerColors: ['#F97316', '#FBBF24', '#22C55E', '#3B82F6', '#A855F7', '#EC4899']
// orange, amber, green, blue, purple, pink
```

---

## Typography

### Font Family

- **Primary:** System default (`System` on iOS, `Roboto` on Android)
- **Monospace:** `Courier` (BPM display, timing data)
- Post-MVP: evaluate custom font (e.g., Inter or SF Pro)

### Size Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `xs` | 12px | 16px | Captions, fine print |
| `sm` | 14px | 20px | Labels, secondary text |
| `md` | 16px | 24px | Body text (default) |
| `lg` | 18px | 28px | Subheadings, baby mode minimum |
| `xl` | 20px | 28px | Section titles |
| `2xl` | 24px | 32px | Screen titles |
| `3xl` | 32px | 40px | Hero numbers (BPM display) |
| `4xl` | 48px | 56px | Baby mode large instructions |

### Font Weights

| Token | Weight | Usage |
|---|---|---|
| `regular` | 400 | Body text |
| `medium` | 500 | Labels, buttons |
| `semibold` | 600 | Subheadings, emphasis |
| `bold` | 700 | Headings, BPM display |

---

## Spacing

Base unit: **4px**

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tight gaps (icon-to-label) |
| `sm` | 8px | Inner padding, list gaps |
| `md` | 16px | Card padding, section gaps |
| `lg` | 24px | Between sections |
| `xl` | 32px | Screen padding horizontal |
| `2xl` | 48px | Major section separation |
| `3xl` | 64px | Top/bottom safe area padding |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 4px | Small chips, tags |
| `md` | 8px | Buttons, inputs |
| `lg` | 12px | Cards |
| `xl` | 16px | Modals, baby mode cards |
| `full` | 9999px | Pills, circular buttons, dots |

---

## Sound Palette

| Sound ID | Description | File Format | Use Case |
|---|---|---|---|
| `click` | Sharp, neutral click | `.wav` | Default metronome, precise timing |
| `clave` | Wooden clave hit | `.wav` | Afro-Cuban patterns, warm feel |
| `woodblock` | Mellow woodblock tap | `.wav` | Softer practice, less fatiguing |
| `djembe` | Hand drum hit (post-MVP) | `.wav` | West African context |
| `handpan` | Resonant handpan tone (post-MVP) | `.wav` | Ambient practice |
| `soft-chime` | Gentle chime (baby mode) | `.wav` | Parent tap zone in duet tap |
| `soft-bell` | Soft bell ring (baby mode) | `.wav` | Baby tap zone in duet tap |

**Audio specs:**
- Format: WAV, 44.1kHz, 16-bit
- Duration: < 200ms per sample (percussive, short decay)
- Baby sounds: longer decay (~400ms), softer attack

**Audio Latency Calibration:**

| Token | Value | Description |
|---|---|---|
| `audioLatencyOffsetMs` | `0` (default) | Calibrated per-device; range -100 to +100. Visual animations are delayed by this offset to compensate for audio output latency. |

---

## Animation Constants

### Beat Visualization

| Token | Value | Description |
|---|---|---|
| `beatPulseScale` | 1.3 | Scale factor on beat hit |
| `beatPulseDuration` | 150ms | Duration of pulse animation |
| `beatPulseEasing` | `Easing.out(Easing.cubic)` | Easing for pulse |
| `rotationDuration` | `(60 / bpm) * lcm(ratioA, ratioB) * 1000` | Full circle rotation time |

### Fade (Disappearing Beat)

| Token | Value | Description |
|---|---|---|
| `fadeDuration` | 2 bars worth of ms at current BPM | Smooth volume fade duration |
| `fadeEasing` | linear | Volume fade curve |

### Baby Mode Animations

| Token | Value | Description |
|---|---|---|
| `babyPulseScale` | 1.2 | Gentler pulse |
| `babyPulseDuration` | 200ms | Slower pulse |
| `babyShapeFloat` | 3s cycle | Gentle floating motion between beats |
| `babyCelebrationDuration` | 800ms | Burst animation length |
| `babyCelebrationScale` | 1.5 | Burst max size |

---

## Baby Mode Overrides

When baby mode tab is active, these overrides apply globally within baby screens:

| Override | Value | Reason |
|---|---|---|
| Baby max volume | `0.5` (50% of system volume) | Hearing safety for infants |
| Baby session max duration | `180s` (3 minutes, with 30s warning) | Prevent overstimulation |
| Tap target hit area minimum | 80px × 80px | Invisible touchable area; may extend beyond visual button bounds via `hitSlop` |
| Minimum font size | 18px (`lg`) | Parent readability while holding baby |
| Border radius minimum | 16px (`xl`) | Softer, friendlier appearance |
| Background color | `babyBackground` | Warm, inviting |
| Text color | `babyTextPrimary` | Dark on light for readability |
| Icon size minimum | 32px | Visible at a glance |
| Button visual height minimum | 56px | Easy one-handed tap (visual size; tap target area may be larger) |
| Card padding | 24px (`lg`) | More breathing room |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle lift (chips, tags) |
| `md` | `0 4px 6px rgba(0,0,0,0.3)` | Cards |
| `lg` | `0 10px 15px rgba(0,0,0,0.4)` | Modals, bottom sheets |

---

## Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `base` | 0 | Default content |
| `card` | 10 | Elevated cards |
| `sticky` | 20 | Sticky headers |
| `modal` | 30 | Modal overlays |
| `tooltip` | 40 | Tooltips (stereo split hint) |
| `toast` | 50 | Toast notifications |

---

## Token Implementation

All design tokens are exported as a single nested `const` object from `src/constants/tokens.ts`. Feature code imports `tokens` and accesses values via dot notation (e.g., `tokens.color.primary`, `tokens.spacing.md`).

```typescript
// src/constants/tokens.ts — expected structure
export const tokens = {
  color: {
    primary, primaryLight, primaryDark,
    secondary, secondaryLight,
    accent,
    background, surface, surfaceLight,
    textPrimary, textSecondary, textMuted,
    success, warning, error,
    border,
    layerA, layerB, beatOne, layerAFaded, layerBFaded,
    // Baby mode
    babyBackground, babySurface, babyPrimary, babySecondary, babyAccent,
    babyTextPrimary, babyTextSecondary, babyTapZoneA, babyTapZoneB, babyCelebration,
    // Drift feedback
    driftLockedIn, driftClose, driftDrifting,
    // Baby visualizer
    babyVisualizerColors,
  },
  spacing: { xs, sm, md, lg, xl, '2xl', '3xl' },
  typography: { fontFamily, monospace, sizes, weights },
  borderRadius: { sm, md, lg, xl, full },
  animation: { beatPulseScale, beatPulseDuration, fadeDuration, /* ... */ },
  audio: { audioLatencyOffsetMs, babyMaxVolume, babySessionMaxDuration },
  baby: { buttonMinHeight, tapTargetMinSize, minFontSize, borderRadiusMin },
  shadow: { sm, md, lg },
  zIndex: { base, card, sticky, modal, tooltip, toast },
} as const;
```
