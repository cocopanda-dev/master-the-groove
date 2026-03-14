import { create } from 'zustand';

export const createMockStore = <T extends object>(initialState: T) =>
  create<T>()(() => initialState);

export const mockAudioStore = {
  isPlaying: false,
  bpm: 100,
  ratioA: 3,
  ratioB: 2,
  layerAVolume: 1,
  layerBVolume: 1,
  stereoSplit: false,
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  setBpm: jest.fn(),
  setRatio: jest.fn(),
  fadeLayer: jest.fn(),
  muteAll: jest.fn(),
  unmuteAll: jest.fn(),
};

export const mockSessionStore = {
  sessions: [],
  currentSession: null,
  pendingFeelState: null,
  startSession: jest.fn(),
  endSession: jest.fn(),
  setFeelState: jest.fn(),
  cleanOrphanedSessions: jest.fn(),
};
