// src/libs/audio/sound-loader.ts
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import type { SoundId } from '@types';
import { clampVolume } from './volume-utils';

const POOL_SIZE = 4;

type SoundPool = {
  instances: AudioPlayer[];
  nextIndex: number;
};

const soundPools: Partial<Record<SoundId, SoundPool>> = {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SOUND_FILES: Partial<Record<SoundId, number>> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  click: require('../../assets/sounds/click.wav'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  clave: require('../../assets/sounds/clave.wav'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  woodblock: require('../../assets/sounds/woodblock.wav'),
};

const MVP_SOUNDS: SoundId[] = ['click', 'clave', 'woodblock'];

export const preloadSounds = async (): Promise<void> => {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });

  for (const name of MVP_SOUNDS) {
    const source = SOUND_FILES[name];
    if (!source) continue;

    const instances: AudioPlayer[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const player = createAudioPlayer(source);
      instances.push(player);
    }
    soundPools[name] = { instances, nextIndex: 0 };
  }
};

export const playSound = async (
  name: SoundId,
  volume: number,
  _pan: number,
): Promise<void> => {
  const pool = soundPools[name];
  if (!pool) return;

  const instance = pool.instances[pool.nextIndex % POOL_SIZE];
  if (!instance) return;

  pool.nextIndex = (pool.nextIndex + 1) % POOL_SIZE;

  instance.volume = clampVolume(volume);
  // Note: expo-audio AudioPlayer does not support pan natively.
  // Stereo split panning requires a lower-level audio API (future enhancement).
  instance.seekTo(0);
  instance.play();
};

export const unloadSounds = async (): Promise<void> => {
  for (const name of MVP_SOUNDS) {
    const pool = soundPools[name];
    if (!pool) continue;
    for (const instance of pool.instances) {
      instance.release();
    }
    delete soundPools[name];
  }
};

export const isSoundLoaded = (name: SoundId): boolean => {
  const pool = soundPools[name];
  return pool !== undefined && pool.instances.length > 0;
};
