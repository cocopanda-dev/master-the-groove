// src/data-access/stores/use-settings-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStorageAdapter } from './create-persisted-store';
import { registerResetFn } from './store-reset';
import type { SoundId } from '@types';

type SettingsState = {
  masterVolume: number;
  defaultBpm: number;
  preferredSoundA: SoundId;
  preferredSoundB: SoundId;
  hapticEnabled: boolean;
  keepScreenAwake: boolean;
  showBeatNumbers: boolean;
  visualizerStyle: 'circular' | 'linear';
  theme: 'light' | 'dark' | 'system';
  babyModeVolumeLimit: number;
  practiceReminderEnabled: boolean;
  practiceReminderTime: string | null;
};

type SettingsActions = {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetToDefaults: () => void;
};

const DEFAULTS: SettingsState = {
  masterVolume: 1.0,
  defaultBpm: 90,
  preferredSoundA: 'click',
  preferredSoundB: 'clave',
  hapticEnabled: true,
  keepScreenAwake: true,
  showBeatNumbers: true,
  visualizerStyle: 'circular',
  theme: 'system',
  babyModeVolumeLimit: 0.7,
  practiceReminderEnabled: false,
  practiceReminderTime: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateSetting: (key, value) => set({ [key]: value }),

      resetToDefaults: () => set(DEFAULTS),
    }),
    {
      name: 'settings-store',
      storage: asyncStorageAdapter,
    },
  ),
);

registerResetFn(() => useSettingsStore.setState(DEFAULTS));
