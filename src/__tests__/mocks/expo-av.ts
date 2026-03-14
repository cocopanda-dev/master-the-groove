// src/__tests__/mocks/expo-audio.ts
// (File kept as expo-av.ts for jest-setup compatibility — mocks expo-audio)
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  release: jest.fn(),
  volume: 1,
  muted: false,
  playing: false,
  isLoaded: true,
  loop: false,
  currentTime: 0,
  duration: 0,
};

const createMockPlayer = () => ({ ...mockPlayer });

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => createMockPlayer()),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

export { mockPlayer };
