# Body Layer Mode
**Phase:** P1
**Depends on:** Audio Engine (accelerometer hook), Navigation (new Practice tab screen)

## What It Does
Trains rhythmic independence by assigning each polyrhythm layer to a different body part (voice, clap, right hand, left hand, or foot stomp). The screen shows animated cues for each assigned body part, and the app tracks input via tap detection for hands, microphone for voice, and device accelerometer for foot stomps. Includes presets for common instrument-specific training patterns.

## Interfaces
```typescript
type BodyPart = 'voice' | 'clap' | 'right-hand' | 'left-hand' | 'foot-stomp';

interface BodyLayerAssignment {
  layerA: BodyPart;
  layerB: BodyPart;
}

interface BodyLayerPreset {
  name: string;
  description: string;
  assignment: BodyLayerAssignment;
}

// Built-in presets
const BODY_LAYER_PRESETS: BodyLayerPreset[] = [
  { name: 'Drummer',   description: 'Hihat + Kick',         assignment: { layerA: 'right-hand', layerB: 'foot-stomp' } },
  { name: 'Pianist',   description: 'Right hand + Left hand', assignment: { layerA: 'right-hand', layerB: 'left-hand' } },
  { name: 'Vocalist',  description: 'Hum + Tap',            assignment: { layerA: 'voice',      layerB: 'clap' } },
  { name: 'Baby',      description: 'Parent clap + Baby bounce', assignment: { layerA: 'clap', layerB: 'foot-stomp' } },
];
```

## Extension Points
- **New screen registered in Practice tab stack** — Expo Router file added under `(tabs)/practice/body-layer.tsx`. Practice tab gains a "Body Layer" entry point card.
- **Accelerometer hook in audio engine** — New `useAccelerometer` hook that detects foot-stomp impacts via `expo-sensors` DeviceMotion API. Threshold-based peak detection converts acceleration spikes into onset events.
- **Preset selector component** — Reusable preset picker component that displays the 4 built-in presets plus a "Custom" option for manual body part assignment.

## Data Shapes
```
sessions (existing table — new field)
  body_part     TEXT NULLABLE    -- JSON-encoded BodyLayerAssignment, null for non-body-layer sessions
```
