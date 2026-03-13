# Composite Shape Visualizer
**Phase:** P1
**Depends on:** Core Polyrhythm Player (visualization mode picker)

## What It Does
Displays both polyrhythm layers as a single unified groove on a circular/radial layout, training the learner to hear two rhythms as one composite feel rather than managing them separately. A "Composite mode" toggle turns off individual layer colors and shows only the combined hit pattern, with a breathing animation style that emphasizes groove feel over mechanical precision.

## Interfaces
```typescript
interface CompositeVisualizerConfig {
  showIndividualLayers: boolean;   // when true, each layer retains its color
  showComposite: boolean;          // when true, combined pattern is rendered
  animationStyle: 'breathing' | 'mechanical';
}

interface CompositeHit {
  angle: number;                   // position on the circle (0-360 degrees)
  layers: ('A' | 'B')[];          // which layers contribute to this hit
  isBeat1: boolean;                // shared downbeat — distinct pulse color
}

interface CompositePattern {
  hits: CompositeHit[];
  cycleSubdivisions: number;       // LCM of the two rhythms (e.g., 6 for 3:2)
}
```

## Extension Points
- **Visualization mode picker on core player screen** — MVP core player has a slot for visualization mode selection (currently only the default radial view). P1 adds "Composite" as a second option in the picker.
- **Replaces or augments radial visualizer** — The composite visualizer shares the same circular canvas as the MVP radial visualizer. It layers composite rendering on top of or in place of the per-layer dot rendering depending on config.

## Data Shapes
No new data tables or fields. This feature is purely visual — configuration is ephemeral UI state held in the Zustand visualization store.
