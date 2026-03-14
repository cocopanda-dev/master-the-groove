// src/libs/audio/volume-utils.ts
export const clampVolume = (vol: number): number => Math.max(0, Math.min(1, vol));

export const computeFinalVolume = (layerVol: number, masterVol: number): number =>
  clampVolume(layerVol * masterVol);
