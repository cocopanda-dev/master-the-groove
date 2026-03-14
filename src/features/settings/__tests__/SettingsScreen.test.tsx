// src/features/settings/__tests__/SettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useSettingsStore } from '@data-access/stores/use-settings-store';
import type { SoundId } from '@types';
import SettingsScreen from '../../../../app/(tabs)/settings/index';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@data-access/stores/use-settings-store', () => ({
  useSettingsStore: jest.fn(),
}));

jest.mock('zustand/shallow', () => ({
  useShallow: jest.fn((fn: unknown) => fn),
}));

jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: MockView } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: Record<string, unknown>) => <MockView {...props}>{children}</MockView>,
  };
});

// ─── Fixture ──────────────────────────────────────────────────────────────────

const mockUseSettingsStore = useSettingsStore as unknown as jest.Mock;

const mockUpdateSetting = jest.fn();
const mockResetToDefaults = jest.fn();

const defaultSettings = {
  masterVolume: 0.8,
  defaultBpm: 90,
  preferredSoundA: 'click' as SoundId,
  preferredSoundB: 'clave' as SoundId,
  hapticEnabled: true,
  keepScreenAwake: true,
  showBeatNumbers: true,
  visualizerStyle: 'circular' as const,
  babyModeVolumeLimit: 0.7,
  updateSetting: mockUpdateSetting,
  resetToDefaults: mockResetToDefaults,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSettingsStore.mockImplementation(
      (selector: (s: typeof defaultSettings) => unknown) => selector(defaultSettings),
    );
  });

  it('renders settings screen with all sections', () => {
    const { getByTestId, getByText } = render(<SettingsScreen />);

    expect(getByTestId('settings-screen')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Display')).toBeTruthy();
    expect(getByText('Feedback')).toBeTruthy();
    expect(getByText('Baby Mode')).toBeTruthy();
    expect(getByText('Reset')).toBeTruthy();
  });

  it('shows current BPM value (90)', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('90')).toBeTruthy();
  });

  it('shows Sound A section with click selected', () => {
    const { getByTestId } = render(<SettingsScreen />);

    const clickPill = getByTestId('sound-a-click');
    expect(clickPill).toBeTruthy();
    expect(clickPill.props.accessibilityState.selected).toBe(true);

    const clavePill = getByTestId('sound-a-clave');
    expect(clavePill.props.accessibilityState.selected).toBe(false);

    const woodblockPill = getByTestId('sound-a-woodblock');
    expect(woodblockPill.props.accessibilityState.selected).toBe(false);
  });

  it('pressing a sound pill calls updateSetting with correct sound', () => {
    const { getByTestId } = render(<SettingsScreen />);

    fireEvent.press(getByTestId('sound-a-clave'));

    expect(mockUpdateSetting).toHaveBeenCalledWith('preferredSoundA', 'clave');
  });

  it('toggling hapticEnabled calls updateSetting("hapticEnabled", false)', () => {
    const { getByTestId } = render(<SettingsScreen />);

    fireEvent.press(getByTestId('toggle-hapticEnabled'));

    expect(mockUpdateSetting).toHaveBeenCalledWith('hapticEnabled', false);
  });

  it('toggling showBeatNumbers calls updateSetting("showBeatNumbers", false)', () => {
    const { getByTestId } = render(<SettingsScreen />);

    fireEvent.press(getByTestId('toggle-showBeatNumbers'));

    expect(mockUpdateSetting).toHaveBeenCalledWith('showBeatNumbers', false);
  });

  it('reset button shows "Reset to Defaults" initially', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Reset to Defaults')).toBeTruthy();
  });

  it('after pressing reset button, shows "Tap again to confirm"', () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    act(() => {
      fireEvent.press(getByText('Reset to Defaults'));
    });

    expect(getByText('Tap again to confirm')).toBeTruthy();

    jest.useRealTimers();
  });

  it('pressing reset button twice calls resetToDefaults()', () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    act(() => {
      fireEvent.press(getByText('Reset to Defaults'));
    });

    act(() => {
      fireEvent.press(getByText('Tap again to confirm'));
    });

    expect(mockResetToDefaults).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
