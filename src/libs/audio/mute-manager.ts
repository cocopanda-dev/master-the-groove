// src/libs/audio/mute-manager.ts
type SetVolumeFn = (layer: 'A' | 'B', volume: number) => void;

export const createMuteManager = () => {
  let preMuteA: number | null = null;
  let preMuteB: number | null = null;

  const mute = (layer: 'A' | 'B', currentVolume: number, setVolume: SetVolumeFn): void => {
    if (layer === 'A') preMuteA = currentVolume;
    else preMuteB = currentVolume;
    setVolume(layer, 0);
  };

  const unmute = (layer: 'A' | 'B', setVolume: SetVolumeFn): void => {
    const vol = layer === 'A' ? preMuteA : preMuteB;
    if (vol !== null) {
      setVolume(layer, vol);
      if (layer === 'A') preMuteA = null;
      else preMuteB = null;
    }
  };

  const muteAll = (volA: number, volB: number, setVolume: SetVolumeFn): void => {
    preMuteA = volA;
    preMuteB = volB;
    setVolume('A', 0);
    setVolume('B', 0);
  };

  const unmuteAll = (setVolume: SetVolumeFn): void => {
    if (preMuteA !== null) setVolume('A', preMuteA);
    if (preMuteB !== null) setVolume('B', preMuteB);
    preMuteA = null;
    preMuteB = null;
  };

  return { mute, unmute, muteAll, unmuteAll };
};
