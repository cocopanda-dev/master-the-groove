// src/features/disappearing-beat/__tests__/use-drift-tracker.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useDriftTracker } from '../hooks/use-drift-tracker';
import type { StageConfig } from '../types';

let cycleCompleteCallback: ((count: number) => void) | null = null;
const mockGetCurrentBeat1Timestamp = jest.fn();
const mockOnCycleComplete = jest.fn((cb: (count: number) => void) => {
  cycleCompleteCallback = cb;
  return () => {
    cycleCompleteCallback = null;
  };
});

jest.mock('@data-access/stores/use-audio-store', () => ({
  useAudioStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      getCurrentBeat1Timestamp: mockGetCurrentBeat1Timestamp,
      onCycleComplete: mockOnCycleComplete,
    };
    return selector(state);
  },
}));

jest.mock('@operations/drift-detection', () => ({
  calculateDrift: jest.fn((expected: number[], taps: number[], _interval: number) => {
    const entries = expected.map((exp, i) => {
      const tap = taps[i] ?? null;
      const driftMs = tap !== null ? tap - exp : null;
      return {
        expectedTimestamp: exp,
        tapTimestamp: tap,
        driftMs,
        zone: driftMs === null ? 'missed' : Math.abs(driftMs) <= 50 ? 'locked-in' : 'drifting',
      };
    });
    const last = entries[entries.length - 1];
    return {
      entries,
      finalDriftMs: last?.driftMs ?? null,
      finalZone: last?.zone ?? 'missed',
      meanAbsDriftMs: null,
    };
  }),
}));

const DEFAULT_CONFIG: StageConfig = {
  ratioA: 3,
  ratioB: 2,
  bpm: 120,
  targetLayer: 'A',
  barsPerStage: 4,
  returnCycles: 2,
};

describe('useDriftTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cycleCompleteCallback = null;
  });

  it('does not record taps when not in stage3', () => {
    const { result } = renderHook(() =>
      useDriftTracker(DEFAULT_CONFIG, 'warmup'),
    );

    act(() => {
      result.current.recordTap(1000);
    });

    const drift = result.current.computeDrift();
    // No expected timestamps, so entries should be empty
    expect(drift.entries).toHaveLength(0);
  });

  it('records taps and computes drift during stage3', () => {
    mockGetCurrentBeat1Timestamp.mockReturnValue(1000);

    const { result } = renderHook(() =>
      useDriftTracker(DEFAULT_CONFIG, 'stage3'),
    );

    // Record some taps
    act(() => {
      result.current.recordTap(1020);
    });

    const drift = result.current.computeDrift();
    // Should have at least 1 entry (from initial timestamp capture)
    expect(drift.entries.length).toBeGreaterThanOrEqual(1);
  });

  it('captures beat 1 timestamps on cycle completion during stage3', () => {
    mockGetCurrentBeat1Timestamp
      .mockReturnValueOnce(1000) // initial
      .mockReturnValueOnce(4000) // cycle complete
      .mockReturnValueOnce(7000); // cycle complete

    const { result } = renderHook(() =>
      useDriftTracker(DEFAULT_CONFIG, 'stage3'),
    );

    // Simulate cycle completions
    act(() => {
      cycleCompleteCallback?.(1);
    });
    act(() => {
      cycleCompleteCallback?.(2);
    });

    act(() => {
      result.current.recordTap(1010);
      result.current.recordTap(4020);
      result.current.recordTap(7030);
    });

    const drift = result.current.computeDrift();
    expect(drift.entries.length).toBe(3);
  });

  it('reset clears all recorded data', () => {
    mockGetCurrentBeat1Timestamp.mockReturnValue(1000);

    const { result } = renderHook(() =>
      useDriftTracker(DEFAULT_CONFIG, 'stage3'),
    );

    act(() => {
      result.current.recordTap(1020);
    });

    act(() => {
      result.current.reset();
    });

    const drift = result.current.computeDrift();
    expect(drift.entries).toHaveLength(0);
  });
});
