// src/features/baby-mode/__tests__/use-baby-session-timer.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';

// Use fake timers for deterministic control
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useBabySessionTimer', () => {
  it('starts at elapsed 0', () => {
    const { result } = renderHook(() => useBabySessionTimer());
    expect(result.current.elapsed).toBe(0);
    expect(result.current.isWarning).toBe(false);
    expect(result.current.isTimeLimitReached).toBe(false);
    expect(result.current.hasExtended).toBe(false);
  });

  it('increments elapsed each second', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsed).toBe(5);
  });

  it('fires onWarning at 150s', () => {
    const onWarning = jest.fn();
    renderHook(() => useBabySessionTimer({ onWarning }));

    act(() => {
      jest.advanceTimersByTime(149_000);
    });
    expect(onWarning).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onWarning).toHaveBeenCalledTimes(1);
  });

  it('sets isWarning to true at 150s', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      jest.advanceTimersByTime(150_000);
    });

    expect(result.current.isWarning).toBe(true);
  });

  it('fires onTimeLimit at 180s', () => {
    const onTimeLimit = jest.fn();
    renderHook(() => useBabySessionTimer({ onTimeLimit }));

    act(() => {
      jest.advanceTimersByTime(179_000);
    });
    expect(onTimeLimit).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onTimeLimit).toHaveBeenCalledTimes(1);
  });

  it('sets isTimeLimitReached at 180s and stops incrementing', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      jest.advanceTimersByTime(180_000);
    });

    expect(result.current.isTimeLimitReached).toBe(true);
    expect(result.current.elapsed).toBe(180);

    // Should not increment further
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.elapsed).toBe(180);
  });

  it('extend adds 60s and resumes timer', () => {
    const onTimeLimit = jest.fn();
    const { result } = renderHook(() => useBabySessionTimer({ onTimeLimit }));

    // Reach the limit
    act(() => {
      jest.advanceTimersByTime(180_000);
    });
    expect(result.current.isTimeLimitReached).toBe(true);
    expect(onTimeLimit).toHaveBeenCalledTimes(1);

    // Extend
    act(() => {
      result.current.extend();
    });

    expect(result.current.hasExtended).toBe(true);
    expect(result.current.isTimeLimitReached).toBe(false);

    // Timer should resume and reach 240s
    act(() => {
      jest.advanceTimersByTime(59_000);
    });
    expect(result.current.isTimeLimitReached).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isTimeLimitReached).toBe(true);
    expect(result.current.elapsed).toBe(240);
    expect(onTimeLimit).toHaveBeenCalledTimes(2);
  });

  it('extension can only be used once', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    // Reach the limit
    act(() => {
      jest.advanceTimersByTime(180_000);
    });

    // First extend works
    act(() => {
      result.current.extend();
    });
    expect(result.current.hasExtended).toBe(true);

    // Reach the new limit
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.isTimeLimitReached).toBe(true);

    // Second extend is a no-op
    act(() => {
      result.current.extend();
    });
    expect(result.current.isTimeLimitReached).toBe(true);
    expect(result.current.elapsed).toBe(240);
  });

  it('onWarning fires only once', () => {
    const onWarning = jest.fn();
    renderHook(() => useBabySessionTimer({ onWarning }));

    act(() => {
      jest.advanceTimersByTime(155_000);
    });

    expect(onWarning).toHaveBeenCalledTimes(1);
  });
});
