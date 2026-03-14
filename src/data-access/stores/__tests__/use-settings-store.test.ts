// src/data-access/stores/__tests__/use-settings-store.test.ts
import { useSettingsStore } from '../use-settings-store';
import { act } from '@testing-library/react-native';

describe('useSettingsStore', () => {
  beforeEach(() => {
    act(() => useSettingsStore.setState(useSettingsStore.getInitialState()));
  });

  it('has correct defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.masterVolume).toBe(1.0);
    expect(state.defaultBpm).toBe(90);
    expect(state.preferredSoundA).toBe('click');
    expect(state.preferredSoundB).toBe('clave');
    expect(state.hapticEnabled).toBe(true);
    expect(state.keepScreenAwake).toBe(true);
    expect(state.showBeatNumbers).toBe(true);
    expect(state.visualizerStyle).toBe('circular');
    expect(state.theme).toBe('system');
    expect(state.babyModeVolumeLimit).toBe(0.7);
    expect(state.practiceReminderEnabled).toBe(false);
    expect(state.practiceReminderTime).toBeNull();
  });

  it('updateSetting changes a single setting', () => {
    act(() => useSettingsStore.getState().updateSetting('defaultBpm', 120));
    expect(useSettingsStore.getState().defaultBpm).toBe(120);
  });

  it('updateSetting is type-safe (string for theme)', () => {
    act(() => useSettingsStore.getState().updateSetting('theme', 'dark'));
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('resetToDefaults restores all values', () => {
    act(() => {
      useSettingsStore.getState().updateSetting('defaultBpm', 200);
      useSettingsStore.getState().updateSetting('theme', 'dark');
      useSettingsStore.getState().resetToDefaults();
    });
    expect(useSettingsStore.getState().defaultBpm).toBe(90);
    expect(useSettingsStore.getState().theme).toBe('system');
  });
});
