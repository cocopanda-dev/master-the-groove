// src/features/disappearing-beat/__tests__/use-disappearing-beat-engine.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useDisappearingBeatEngine } from '../hooks/use-disappearing-beat-engine';
import type { StageConfig } from '../types';

// Mock the audio store
const mockPlay = jest.fn();
const mockStop = jest.fn();
const mockSetRatio = jest.fn();
const mockSetBpm = jest.fn();
const mockFadeLayer = jest.fn();
const mockMuteAll = jest.fn();
const mockUnmuteAll = jest.fn();
const mockSetVolumeA = jest.fn();
const mockSetVolumeB = jest.fn();

let cycleCompleteCallback: ((count: number) => void) | null = null;
const mockOnCycleComplete = jest.fn((cb: (count: number) => void) => {
  cycleCompleteCallback = cb;
  return () => {
    cycleCompleteCallback = null;
  };
});

jest.mock('@data-access/stores', () => ({
  useAudioStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      play: mockPlay,
      stop: mockStop,
      setRatio: mockSetRatio,
      setBpm: mockSetBpm,
      fadeLayer: mockFadeLayer,
      muteAll: mockMuteAll,
      unmuteAll: mockUnmuteAll,
      setVolumeA: mockSetVolumeA,
      setVolumeB: mockSetVolumeB,
      onCycleComplete: mockOnCycleComplete,
    };
    return selector(state);
  },
}));

const DEFAULT_CONFIG: StageConfig = {
  ratioA: 3,
  ratioB: 2,
  bpm: 120,
  targetLayer: 'A',
  barsPerStage: 2,
  returnCycles: 1,
};

describe('useDisappearingBeatEngine', () => {
  let onComplete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    cycleCompleteCallback = null;
    onComplete = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in idle stage', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    expect(result.current.stage).toBe('idle');
    expect(result.current.barCount).toBe(0);
    expect(result.current.volumeA).toBe(1);
    expect(result.current.volumeB).toBe(1);
  });

  it('transitions to warmup when start() is called', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.stage).toBe('warmup');
    expect(mockSetRatio).toHaveBeenCalledWith(3, 2);
    expect(mockSetBpm).toHaveBeenCalledWith(120);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('increments bar count on cycle completion during warmup', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => {
      result.current.start();
    });

    // Simulate one cycle
    act(() => {
      cycleCompleteCallback?.(1);
    });

    expect(result.current.barCount).toBe(1);
    expect(result.current.stage).toBe('warmup');
  });

  it('transitions from warmup to stage1 after barsPerStage and MIN_WARMUP_MS', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => {
      result.current.start();
    });

    // Advance time past MIN_WARMUP_MS (8000ms)
    jest.advanceTimersByTime(9000);

    // Complete enough bars
    act(() => {
      cycleCompleteCallback?.(1);
    });
    act(() => {
      jest.runAllTimers();
    });
    act(() => {
      cycleCompleteCallback?.(2);
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.stage).toBe('stage1');
    expect(mockFadeLayer).toHaveBeenCalledWith('A', 0.5, 2);
  });

  it('transitions from stage1 to stage2 after barsPerStage', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => {
      result.current.start();
    });

    // Pass warmup
    jest.advanceTimersByTime(9000);
    act(() => { cycleCompleteCallback?.(1); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(2); });
    act(() => { jest.runAllTimers(); });

    // Now in stage1, complete barsPerStage (2)
    expect(result.current.stage).toBe('stage1');

    act(() => { cycleCompleteCallback?.(3); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(4); });
    act(() => { jest.runAllTimers(); });

    expect(result.current.stage).toBe('stage2');
    expect(mockFadeLayer).toHaveBeenCalledWith('A', 0, 2);
  });

  it('transitions from stage2 to stage3 (both muted)', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => { result.current.start(); });
    jest.advanceTimersByTime(9000);

    // warmup -> stage1
    act(() => { cycleCompleteCallback?.(1); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(2); });
    act(() => { jest.runAllTimers(); });

    // stage1 -> stage2
    act(() => { cycleCompleteCallback?.(3); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(4); });
    act(() => { jest.runAllTimers(); });

    // stage2 -> stage3
    act(() => { cycleCompleteCallback?.(5); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(6); });
    act(() => { jest.runAllTimers(); });

    expect(result.current.stage).toBe('stage3');
    expect(mockMuteAll).toHaveBeenCalled();
    expect(result.current.volumeA).toBe(0);
    expect(result.current.volumeB).toBe(0);
  });

  it('transitions from stage3 to return (unmuted)', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => { result.current.start(); });
    jest.advanceTimersByTime(9000);

    // Run through warmup, stage1, stage2 to stage3
    for (let i = 1; i <= 6; i++) {
      act(() => { cycleCompleteCallback?.(i); });
      act(() => { jest.runAllTimers(); });
    }

    expect(result.current.stage).toBe('stage3');

    // stage3 -> return
    act(() => { cycleCompleteCallback?.(7); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(8); });
    act(() => { jest.runAllTimers(); });

    expect(result.current.stage).toBe('return');
    expect(mockUnmuteAll).toHaveBeenCalled();
    expect(result.current.volumeA).toBe(1);
    expect(result.current.volumeB).toBe(1);
  });

  it('completes after return cycles and calls onComplete', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => { result.current.start(); });
    jest.advanceTimersByTime(9000);

    // Run through all stages: warmup(2) + stage1(2) + stage2(2) + stage3(2) + return(1)
    for (let i = 1; i <= 8; i++) {
      act(() => { cycleCompleteCallback?.(i); });
      act(() => { jest.runAllTimers(); });
    }

    expect(result.current.stage).toBe('return');

    // return -> completed (returnCycles = 1)
    act(() => { cycleCompleteCallback?.(9); });
    act(() => { jest.runAllTimers(); });

    expect(result.current.stage).toBe('completed');
    expect(mockStop).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
        config: DEFAULT_CONFIG,
      }),
    );
  });

  it('stop() ends early and calls onComplete with completed=false', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => { result.current.start(); });

    act(() => { result.current.stop(); });

    expect(mockStop).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: false,
      }),
    );
  });

  it('reports correct highest stage when stopped mid-session', () => {
    const { result } = renderHook(() =>
      useDisappearingBeatEngine(DEFAULT_CONFIG, onComplete),
    );

    act(() => { result.current.start(); });
    jest.advanceTimersByTime(9000);

    // warmup -> stage1
    act(() => { cycleCompleteCallback?.(1); });
    act(() => { jest.runAllTimers(); });
    act(() => { cycleCompleteCallback?.(2); });
    act(() => { jest.runAllTimers(); });

    // Now in stage1, stop
    act(() => { result.current.stop(); });

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        highestStage: 1,
        completed: false,
      }),
    );
  });
});
