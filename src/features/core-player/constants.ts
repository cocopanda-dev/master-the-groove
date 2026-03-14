// src/features/core-player/constants.ts
import { MVP_RATIOS } from '@types';
import { colors } from '@design-system/tokens/colors';
import type { MvpSoundOption, LayerId } from './types';

export { MVP_RATIOS };

export const LAYER_COLORS: Record<LayerId, string> = {
  A: colors.layerA,
  B: colors.layerB,
};

/** Which ratios are currently playable vs coming-soon. */
export const ACTIVE_RATIO_IDS: ReadonlySet<string> = new Set(['3-2', '4-3']);

export const MVP_SOUND_OPTIONS: MvpSoundOption[] = [
  { id: 'click', label: 'Click' },
  { id: 'clave', label: 'Clave' },
  { id: 'woodblock', label: 'Woodblock' },
];

/** Minimum session duration (seconds) to be persisted. */
export const MIN_SESSION_DURATION_S = 10;

/** Minimum session duration (seconds) to trigger feel-state prompt. */
export const FEEL_STATE_PROMPT_THRESHOLD_S = 30;

/** Default BPM. */
export const DEFAULT_BPM = 90;

/** Default volume (0–1). */
export const DEFAULT_VOLUME = 0.8;
