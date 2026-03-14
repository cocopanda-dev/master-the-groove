// src/libs/audio/sound-loader.ts
import { Audio } from 'expo-av';
import type { SoundId } from '@types';
import { clampVolume } from './volume-utils';

const POOL_SIZE = 4;

type SoundInstance = InstanceType<typeof Audio.Sound>;

type SoundPool = {
  instances: SoundInstance[];
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
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });

  for (const name of MVP_SOUNDS) {
    const source = SOUND_FILES[name];
    if (!source) continue;

    const instances: SoundInstance[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      instances.push(sound);
    }
    soundPools[name] = { instances, nextIndex: 0 };
  }
};

export const playSound = async (
  name: SoundId,
  volume: number,
  pan: number,
): Promise<void> => {
  const pool = soundPools[name];
  if (!pool) return;

  const instance = pool.instances[pool.nextIndex % POOL_SIZE];
  if (!instance) return;

  pool.nextIndex = (pool.nextIndex + 1) % POOL_SIZE;

  await instance.setStatusAsync({
    shouldPlay: true,
    positionMillis: 0,
    volume: clampVolume(volume),
    audioPan: Math.max(-1, Math.min(1, pan)),
  });
};

export const unloadSounds = async (): Promise<void> => {
  for (const name of MVP_SOUNDS) {
    const pool = soundPools[name];
    if (!pool) continue;
    for (const instance of pool.instances) {
      await instance.unloadAsync();
    }
    delete soundPools[name];
  }
};

export const isSoundLoaded = (name: SoundId): boolean => {
  const pool = soundPools[name];
  return pool !== undefined && pool.instances.length > 0;
};
