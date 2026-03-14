// src/features/core-player/__tests__/use-core-player.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCorePlayer } from '../hooks/use-core-player';

// Mock the stores
jest.mock('@data-access/stores/use-audio-store');
jest.mock('@data-access/stores/use-session-store');
jest.mock('@data-access/stores/use-settings-store', () => ({
  useSettingsStore: jest.fn(() => ({
    defaultBpm: 90,
    preferredSoundA: 'click',
    preferredSoundB: 'clave',
    masterVolume: 1.0,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useAudioStore } = require('@data-access/stores/use-audio-store') as {
  useAudioStore: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useSessionStore } = require('@data-access/stores/use-session-store') as {
  useSessionStore: jest.Mock;
};

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockStop = jest.fn();
const mockSetRatio = jest.fn();
const mockSetBpm = jest.fn();
const mockSetSoundA = jest.fn();
const mockSetSoundB = jest.fn();
const mockSetMasterVolume = jest.fn();

const mockStartSession = jest.fn();
const mockEndSession = jest.fn();
const mockRecordFeelState = jest.fn();
const mockSkipFeelState = jest.fn();
const mockCompleteSession = jest.fn();

const createAudioStore = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  isPlaying: false,
  isPaused: false,
  bpm: 90,
  ratioA: 3,
  ratioB: 2,
  soundA: 'click',
  soundB: 'clave',
  volumeA: 0.8,
  volumeB: 0.8,
  masterVolume: 1.0,
  stereoSplit: false,
  play: mockPlay,
  pause: mockPause,
  stop: mockStop,
  setRatio: mockSetRatio,
  setBpm: mockSetBpm,
  setSoundA: mockSetSoundA,
  setSoundB: mockSetSoundB,
  setMasterVolume: mockSetMasterVolume,
  onBeat: jest.fn(() => jest.fn()),
  onCycleComplete: jest.fn(() => jest.fn()),
  ...overrides,
});

const createSessionStore = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  lifecycleState: 'idle',
  currentSession: null,
  startSession: mockStartSession,
  endSession: mockEndSession,
  recordFeelState: mockRecordFeelState,
  skipFeelState: mockSkipFeelState,
  completeSession: mockCompleteSession,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useAudioStore.mockReturnValue(createAudioStore());
  useSessionStore.mockReturnValue(createSessionStore());
});

describe('useCorePlayer', () => {
  describe('status', () => {
    it('returns idle when not playing and not paused', () => {
      useAudioStore.mockReturnValue(createAudioStore({ isPlaying: false, isPaused: false }));
      const { result } = renderHook(() => useCorePlayer());
      expect(result.current.status).toBe('idle');
    });

    it('returns playing when audio is playing', () => {
      useAudioStore.mockReturnValue(createAudioStore({ isPlaying: true, isPaused: false }));
      const { result } = renderHook(() => useCorePlayer());
      expect(result.current.status).toBe('playing');
    });

    it('returns paused when audio is paused', () => {
      useAudioStore.mockReturnValue(createAudioStore({ isPlaying: false, isPaused: true }));
      const { result } = renderHook(() => useCorePlayer());
      expect(result.current.status).toBe('paused');
    });
  });

  describe('onPlay', () => {
    it('starts a session when lifecycle is idle', () => {
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onPlay();
      });
      expect(mockStartSession).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'free-play' }),
      );
      expect(mockPlay).toHaveBeenCalled();
    });

    it('does not start a new session when already recording', () => {
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'recording' }),
      );
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onPlay();
      });
      expect(mockStartSession).not.toHaveBeenCalled();
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('onPause', () => {
    it('calls audio.pause()', () => {
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onPause();
      });
      expect(mockPause).toHaveBeenCalled();
    });
  });

  describe('onStop — session duration logic', () => {
    it('discards session shorter than 10 seconds', () => {
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'recording' }),
      );
      const { result } = renderHook(() => useCorePlayer());

      // Simulate play then immediate stop (< 10s)
      act(() => {
        result.current.onPlay();
      });
      act(() => {
        result.current.onStop();
      });

      expect(mockEndSession).toHaveBeenCalledWith(null);
      expect(mockSkipFeelState).toHaveBeenCalled();
      expect(mockCompleteSession).toHaveBeenCalled();
    });

    it('does nothing if lifecycle is not recording', () => {
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'idle' }),
      );
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onStop();
      });
      expect(mockEndSession).not.toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('onSelectRatio', () => {
    it('sets ratio on audio store', () => {
      const { result } = renderHook(() => useCorePlayer());
      const ratio = { id: '4-3', ratioA: 4, ratioB: 3, name: '4:3', displayName: 'Four against Three', culturalOrigin: '', mnemonic: '' };
      act(() => {
        result.current.onSelectRatio(ratio);
      });
      expect(mockSetRatio).toHaveBeenCalledWith(4, 3);
    });

    it('ignores coming-soon ratios', () => {
      const { result } = renderHook(() => useCorePlayer());
      const comingSoonRatio = { id: '2-3', ratioA: 2, ratioB: 3, name: '2:3', displayName: 'Two against Three', culturalOrigin: '', mnemonic: '' };
      act(() => {
        result.current.onSelectRatio(comingSoonRatio);
      });
      expect(mockSetRatio).not.toHaveBeenCalled();
    });

    it('stops playback when changing ratio while playing', () => {
      useAudioStore.mockReturnValue(createAudioStore({ isPlaying: true }));
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'recording' }),
      );
      const { result } = renderHook(() => useCorePlayer());
      const ratio = { id: '4-3', ratioA: 4, ratioB: 3, name: '4:3', displayName: 'Four against Three', culturalOrigin: '', mnemonic: '' };
      act(() => {
        result.current.onSelectRatio(ratio);
      });
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('feel-state prompt', () => {
    it('initially has prompt hidden', () => {
      const { result } = renderHook(() => useCorePlayer());
      expect(result.current.feelStatePrompt.visible).toBe(false);
    });

    it('onSubmitFeelState records state and dismisses prompt', () => {
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'pendingFeelState' }),
      );
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onSubmitFeelState('feeling');
      });
      expect(mockRecordFeelState).toHaveBeenCalledWith('feeling');
      expect(mockCompleteSession).toHaveBeenCalled();
      expect(result.current.feelStatePrompt.visible).toBe(false);
    });

    it('onSkipFeelState skips and dismisses prompt', () => {
      useSessionStore.mockReturnValue(
        createSessionStore({ lifecycleState: 'pendingFeelState' }),
      );
      const { result } = renderHook(() => useCorePlayer());
      act(() => {
        result.current.onSkipFeelState();
      });
      expect(mockSkipFeelState).toHaveBeenCalled();
      expect(mockCompleteSession).toHaveBeenCalled();
      expect(result.current.feelStatePrompt.visible).toBe(false);
    });
  });

  describe('default ratio', () => {
    it('starts with the 3:2 ratio selected', () => {
      const { result } = renderHook(() => useCorePlayer());
      expect(result.current.selectedRatio.id).toBe('3-2');
    });
  });
});
