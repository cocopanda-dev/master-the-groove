// src/libs/audio/__tests__/mute-manager.test.ts
import { createMuteManager } from '../mute-manager';

describe('MuteManager', () => {
  it('mute stores pre-mute volume and sets to 0', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.mute('A', 0.8, setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0);
  });

  it('unmute restores pre-mute volume', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.mute('A', 0.8, setVolume);
    manager.unmute('A', setVolume);
    expect(setVolume).toHaveBeenLastCalledWith('A', 0.8);
  });

  it('muteAll stores both volumes', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.muteAll(0.7, 0.9, setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0);
    expect(setVolume).toHaveBeenCalledWith('B', 0);
  });

  it('unmuteAll restores both volumes', () => {
    const setVolume = jest.fn();
    const manager = createMuteManager();

    manager.muteAll(0.7, 0.9, setVolume);
    setVolume.mockClear();
    manager.unmuteAll(setVolume);
    expect(setVolume).toHaveBeenCalledWith('A', 0.7);
    expect(setVolume).toHaveBeenCalledWith('B', 0.9);
  });
});
