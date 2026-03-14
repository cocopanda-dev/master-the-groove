// src/__tests__/mocks/expo-av.ts
const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  pauseAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  setStatusAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: { ...mockSound },
        status: { isLoaded: true },
      }),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

export { mockSound };
