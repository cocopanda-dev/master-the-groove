// src/libs/audio/__tests__/sound-loader.test.ts
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { preloadSounds, playSound, unloadSounds, isSoundLoaded } from '../sound-loader';

describe('SoundLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preloadSounds', () => {
    it('calls createAudioPlayer for each MVP sound', async () => {
      await preloadSounds();
      // 3 MVP sounds x 4 pool size = 12 calls
      expect(createAudioPlayer).toHaveBeenCalledTimes(12);
    });

    it('sets audio mode for silent playback', async () => {
      await preloadSounds();
      expect(setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        }),
      );
    });
  });

  describe('isSoundLoaded', () => {
    it('returns true for loaded sounds', async () => {
      await preloadSounds();
      expect(isSoundLoaded('click')).toBe(true);
      expect(isSoundLoaded('clave')).toBe(true);
      expect(isSoundLoaded('woodblock')).toBe(true);
    });

    it('returns false for unloaded sounds', () => {
      expect(isSoundLoaded('djembe')).toBe(false);
    });
  });

  describe('unloadSounds', () => {
    it('releases all sound instances', async () => {
      await preloadSounds();
      await unloadSounds();
      expect(isSoundLoaded('click')).toBe(false);
    });
  });
});

// Suppress unused import warning
const _unused = playSound;
void _unused;
