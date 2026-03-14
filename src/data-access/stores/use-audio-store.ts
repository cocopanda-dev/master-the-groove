// src/data-access/stores/use-audio-store.ts
import { create } from 'zustand';
import { createTransport } from '@libs/audio/transport';
import { createMuteManager } from '@libs/audio/mute-manager';
import { createFadeEngine } from '@libs/audio/fade-engine';
import { createTapTempo } from '@operations/polyrhythm';
import type { SoundId } from '@types';

type AudioState = {
  isPlaying: boolean;
  isPaused: boolean;
  bpm: number;
  ratioA: number;
  ratioB: number;
  soundA: SoundId;
  soundB: SoundId;
  volumeA: number;
  volumeB: number;
  masterVolume: number;
  stereoSplit: boolean;
  currentBeatA: number;
  currentBeatB: number;
  cycleCount: number;
};

type AudioActions = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  tapTempo: () => void;
  setRatio: (a: number, b: number) => void;
  setSoundA: (sound: SoundId) => void;
  setSoundB: (sound: SoundId) => void;
  setVolumeA: (volume: number) => void;
  setVolumeB: (volume: number) => void;
  setMasterVolume: (volume: number) => void;
  muteLayer: (layer: 'A' | 'B') => void;
  unmuteLayer: (layer: 'A' | 'B') => void;
  muteAll: () => void;
  unmuteAll: () => void;
  fadeLayer: (layer: 'A' | 'B', targetVolume: number, durationCycles: number) => void;
  setStereoSplit: (enabled: boolean) => void;
  getCurrentBeat1Timestamp: () => number;
  onBeat: (cb: (layer: 'A' | 'B', beatIndex: number, ts: number) => void) => () => void;
  onCycleComplete: (cb: (cycleCount: number) => void) => () => void;
};

const transport = createTransport();
const muteManager = createMuteManager();
const fadeEngine = createFadeEngine();
const tapTempoEngine = createTapTempo();

const applyLayerVolume = (
  layer: 'A' | 'B',
  volume: number,
  set: (partial: Partial<AudioState>) => void,
): void => {
  transport[layer === 'A' ? 'setVolumeA' : 'setVolumeB'](volume);
  set(layer === 'A' ? { volumeA: volume } : { volumeB: volume });
};

export const useAudioStore = create<AudioState & AudioActions>()((set, get) => ({
  // Initial state
  isPlaying: false,
  isPaused: false,
  bpm: 90,
  ratioA: 3,
  ratioB: 2,
  soundA: 'click',
  soundB: 'clave',
  volumeA: 0.8,
  volumeB: 0.8,
  masterVolume: 1.0,
  stereoSplit: false,
  currentBeatA: 0,
  currentBeatB: 0,
  cycleCount: 0,

  play: () => {
    const state = get();
    transport.setRatio(state.ratioA, state.ratioB);
    transport.setBpm(state.bpm);
    transport.setSoundA(state.soundA);
    transport.setSoundB(state.soundB);
    transport.setVolumeA(state.volumeA);
    transport.setVolumeB(state.volumeB);
    transport.setMasterVolume(state.masterVolume);
    transport.setStereoSplit(state.stereoSplit);
    transport.play();
    set({ isPlaying: true, isPaused: false });
  },

  pause: () => {
    transport.pause();
    set({ isPlaying: false, isPaused: true });
  },

  stop: () => {
    transport.stop();
    fadeEngine.cancelFade('A');
    fadeEngine.cancelFade('B');
    tapTempoEngine.reset();
    set({
      isPlaying: false,
      isPaused: false,
      currentBeatA: 0,
      currentBeatB: 0,
      cycleCount: 0,
    });
  },

  setBpm: (bpm) => {
    const clamped = Math.max(20, Math.min(240, bpm));
    transport.setBpm(clamped);
    set({ bpm: clamped });
  },

  tapTempo: () => {
    const result = tapTempoEngine.tap();
    if (result !== null) {
      get().setBpm(result);
    }
  },

  setRatio: (a, b) => {
    transport.setRatio(a, b);
    set({ ratioA: a, ratioB: b });
  },

  setSoundA: (sound) => {
    transport.setSoundA(sound);
    set({ soundA: sound });
  },

  setSoundB: (sound) => {
    transport.setSoundB(sound);
    set({ soundB: sound });
  },

  setVolumeA: (volume) => {
    fadeEngine.cancelFade('A');
    transport.setVolumeA(volume);
    set({ volumeA: volume });
  },

  setVolumeB: (volume) => {
    fadeEngine.cancelFade('B');
    transport.setVolumeB(volume);
    set({ volumeB: volume });
  },

  setMasterVolume: (volume) => {
    transport.setMasterVolume(volume);
    set({ masterVolume: volume });
  },

  muteLayer: (layer) => {
    const vol = layer === 'A' ? get().volumeA : get().volumeB;
    muteManager.mute(layer, vol, (l, v) => applyLayerVolume(l, v, set));
  },

  unmuteLayer: (layer) => {
    muteManager.unmute(layer, (l, v) => applyLayerVolume(l, v, set));
  },

  muteAll: () => {
    const { volumeA, volumeB } = get();
    muteManager.muteAll(volumeA, volumeB, (l, v) => applyLayerVolume(l, v, set));
  },

  unmuteAll: () => {
    muteManager.unmuteAll((l, v) => applyLayerVolume(l, v, set));
  },

  fadeLayer: (layer, targetVolume, durationCycles) => {
    const currentVol = layer === 'A' ? get().volumeA : get().volumeB;
    const ratio = layer === 'A' ? get().ratioA : get().ratioB;
    const totalSteps = durationCycles * ratio;
    fadeEngine.startFade({
      layer,
      fromVolume: currentVol,
      targetVolume,
      totalSteps,
      setVolume: (l, v) => applyLayerVolume(l, v, set),
    });
  },

  setStereoSplit: (enabled) => {
    transport.setStereoSplit(enabled);
    set({ stereoSplit: enabled });
  },

  getCurrentBeat1Timestamp: () => transport.getBeat1Timestamp(),

  onBeat: (cb) => {
    const unsub = transport.onBeat((layer, beatIndex, ts) => {
      set(layer === 'A' ? { currentBeatA: beatIndex } : { currentBeatB: beatIndex });
      fadeEngine.tick(layer);
      cb(layer, beatIndex, ts);
    });
    return unsub;
  },

  onCycleComplete: (cb) => {
    const unsub = transport.onCycleComplete((count) => {
      set({ cycleCount: count });
      cb(count);
    });
    return unsub;
  },
}));
