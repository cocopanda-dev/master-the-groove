// src/libs/audio/fade-engine.ts
type FadeConfig = {
  layer: 'A' | 'B';
  fromVolume: number;
  targetVolume: number;
  totalSteps: number;
  setVolume: (layer: 'A' | 'B', volume: number) => void;
};

type FadeState = {
  currentStep: number;
  totalSteps: number;
  fromVolume: number;
  delta: number;
  setVolume: (layer: 'A' | 'B', volume: number) => void;
};

export const createFadeEngine = () => {
  const activeFades: Partial<Record<'A' | 'B', FadeState>> = {};

  const startFade = (config: FadeConfig): void => {
    const delta = (config.targetVolume - config.fromVolume) / config.totalSteps;
    activeFades[config.layer] = {
      currentStep: 0,
      totalSteps: config.totalSteps,
      fromVolume: config.fromVolume,
      delta,
      setVolume: config.setVolume,
    };
  };

  const tick = (layer: 'A' | 'B'): void => {
    const fade = activeFades[layer];
    if (!fade) return;

    fade.currentStep++;
    const newVolume = fade.fromVolume + fade.delta * fade.currentStep;
    const clamped = Math.max(0, Math.min(1, Math.round(newVolume * 1000) / 1000));

    fade.setVolume(layer, clamped);

    if (fade.currentStep >= fade.totalSteps) {
      delete activeFades[layer];
    }
  };

  const cancelFade = (layer: 'A' | 'B'): void => {
    delete activeFades[layer];
  };

  const hasFade = (layer: 'A' | 'B'): boolean => activeFades[layer] !== undefined;

  return { startFade, tick, cancelFade, hasFade };
};
