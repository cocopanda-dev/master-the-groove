/**
 * Available sounds in the app's sound bank.
 *
 * Canonical name is SoundId. All specs and stores must use this name (not SoundName).
 *
 * MVP sounds: 'click', 'clave', 'woodblock'
 * Full set includes baby-friendly soft tones.
 *
 * Sound files live in assets/sounds/{sound-id}.wav
 */
type SoundId =
  | 'click'
  | 'clave'
  | 'woodblock'
  | 'djembe'
  | 'handpan'
  | 'soft-chime'
  | 'soft-bell';

interface AudioConfig {
  /** Beats per cycle for layer A */
  ratioA: number;

  /** Beats per cycle for layer B */
  ratioB: number;

  /** Tempo in beats per minute */
  bpm: number;

  /** Sound for layer A */
  soundA: SoundId;

  /** Sound for layer B */
  soundB: SoundId;

  /** Which layer(s) to play: 'A' only, 'B' only, or 'both' (default: 'both') */
  layers?: 'A' | 'B' | 'both';

  /** Whether to split layers to left/right audio channels */
  stereoSplit: boolean;

  /** Volume for layer A (0.0 to 1.0) */
  volumeA: number;

  /** Volume for layer B (0.0 to 1.0) */
  volumeB: number;
}

/**
 * Represents an in-progress volume fade on a single layer.
 * Used by the audio engine to animate volume changes during Disappearing Beat mode.
 */
interface FadeState {
  /** Which layer is fading */
  layer: 'A' | 'B';

  /** Volume level at fade start (0.0 to 1.0) */
  fromVolume: number;

  /** Target volume level (0.0 to 1.0) */
  toVolume: number;

  /** Timestamp (ms) when the fade started */
  startTime: number;

  /** Duration of the fade in milliseconds */
  duration: number;
}

interface DisappearingBeatConfig {
  /** Which layer disappears first: 'A' or 'B' */
  targetLayer: 'A' | 'B';

  /** Number of bars (complete cycles) per disappearing stage */
  barsPerStage: number;

  /**
   * Number of disappearing stages (default 3 for MVP):
   *   Stage 1: target fades to 50%
   *   Stage 2: target mutes completely
   *   Stage 3: both layers mute
   */
  stages: number;

  /** Number of full disappearing cycles before auto-stop (0 = infinite) */
  cycleCount: number;
}

export type { SoundId, AudioConfig, FadeState, DisappearingBeatConfig };
