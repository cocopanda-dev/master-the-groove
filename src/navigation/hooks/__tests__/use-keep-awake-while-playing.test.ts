import { renderHook } from '@testing-library/react-native';
import { useKeepAwakeWhilePlaying } from '../use-keep-awake-while-playing';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const mockAudioStore = {
  isPlaying: false,
};

jest.mock('@data-access/stores/use-audio-store', () => ({
  useAudioStore: (selector: (state: typeof mockAudioStore) => unknown) => selector(mockAudioStore),
}));

describe('useKeepAwakeWhilePlaying', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioStore.isPlaying = false;
  });

  it('activates keep-awake when isPlaying is true', () => {
    mockAudioStore.isPlaying = true;
    renderHook(() => useKeepAwakeWhilePlaying());
    expect(activateKeepAwakeAsync).toHaveBeenCalled();
  });

  it('does not activate or deactivate keep-awake when isPlaying is false', () => {
    mockAudioStore.isPlaying = false;
    renderHook(() => useKeepAwakeWhilePlaying());
    expect(activateKeepAwakeAsync).not.toHaveBeenCalled();
    expect(deactivateKeepAwake).not.toHaveBeenCalled();
  });

  it('deactivates keep-awake on unmount', () => {
    mockAudioStore.isPlaying = true;
    const { unmount } = renderHook(() => useKeepAwakeWhilePlaying());
    jest.clearAllMocks();
    unmount();
    expect(deactivateKeepAwake).toHaveBeenCalled();
  });
});

describe('useKeepAwakeWhilePlaying with always option', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioStore.isPlaying = false;
  });

  it('activates keep-awake regardless of isPlaying when always is true', () => {
    mockAudioStore.isPlaying = false;
    renderHook(() => useKeepAwakeWhilePlaying({ always: true }));
    expect(activateKeepAwakeAsync).toHaveBeenCalled();
  });

  it('deactivates on unmount even when always is true', () => {
    const { unmount } = renderHook(() => useKeepAwakeWhilePlaying({ always: true }));
    jest.clearAllMocks();
    unmount();
    expect(deactivateKeepAwake).toHaveBeenCalled();
  });
});
