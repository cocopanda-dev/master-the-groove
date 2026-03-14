// src/features/core-player/types.ts
import type { SoundId, PolyrhythmRatio, FeelState } from '@types';

export type LayerId = 'A' | 'B';

export type LayerSettings = {
  sound: SoundId;
  volume: number;
  muted: boolean;
};

export type CorePlayerSettings = {
  ratio: PolyrhythmRatio;
  bpm: number;
  layerA: LayerSettings;
  layerB: LayerSettings;
  stereoSplit: boolean;
};

export type CorePlayerStatus = 'idle' | 'playing' | 'paused';

export type FeelStatePromptState = {
  visible: boolean;
  sessionDuration: number;
};

/**
 * MVP sound options shown in the sound selector.
 */
export type MvpSoundOption = {
  id: SoundId;
  label: string;
};

export type { FeelState };
