// src/data-access/stores/__tests__/use-audio-store.test.ts
import { useAudioStore } from '../use-audio-store';
import { act } from '@testing-library/react-native';

describe('useAudioStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => {
      useAudioStore.getState().stop();
    });
  });

  afterEach(() => jest.useRealTimers());

  it('has correct initial state', () => {
    const state = useAudioStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.bpm).toBe(90);
    expect(state.ratioA).toBe(3);
    expect(state.ratioB).toBe(2);
    expect(state.soundA).toBe('click');
    expect(state.soundB).toBe('clave');
    expect(state.volumeA).toBe(0.8);
    expect(state.volumeB).toBe(0.8);
    expect(state.masterVolume).toBe(1.0);
    expect(state.stereoSplit).toBe(false);
    expect(state.cycleCount).toBe(0);
  });

  it('setBpm clamps to 20-240', () => {
    act(() => useAudioStore.getState().setBpm(300));
    expect(useAudioStore.getState().bpm).toBe(240);
    act(() => useAudioStore.getState().setBpm(5));
    expect(useAudioStore.getState().bpm).toBe(20);
  });

  it('setRatio updates both values', () => {
    act(() => useAudioStore.getState().setRatio(4, 3));
    expect(useAudioStore.getState().ratioA).toBe(4);
    expect(useAudioStore.getState().ratioB).toBe(3);
  });

  it('play sets isPlaying to true', () => {
    act(() => useAudioStore.getState().play());
    expect(useAudioStore.getState().isPlaying).toBe(true);
  });

  it('stop resets transport state', () => {
    act(() => useAudioStore.getState().play());
    act(() => useAudioStore.getState().stop());
    expect(useAudioStore.getState().isPlaying).toBe(false);
    expect(useAudioStore.getState().cycleCount).toBe(0);
  });

  it('muteLayer stores pre-mute volume', () => {
    act(() => useAudioStore.getState().muteLayer('A'));
    expect(useAudioStore.getState().volumeA).toBe(0);
  });

  it('unmuteLayer restores volume', () => {
    const origVol = useAudioStore.getState().volumeA;
    act(() => useAudioStore.getState().muteLayer('A'));
    act(() => useAudioStore.getState().unmuteLayer('A'));
    expect(useAudioStore.getState().volumeA).toBe(origVol);
  });
});
