// src/features/baby-mode/__tests__/use-baby-session-timer.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useBabySessionTimer } from '../hooks/use-baby-session-timer';
import { SESSION_LIMIT_S, SESSION_WARNING_S, SESSION_EXTENSION_S } from '../constants';

describe('useBabySessionTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    expect(result.current.status).toBe('idle');
    expect(result.current.elapsed).toBe(0);
    expect(result.current.remaining).toBe(SESSION_LIMIT_S);
  });

  it('transitions to running when started', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe('running');
  });

  it('increments elapsed time each second', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsed).toBe(5);
    expect(result.current.remaining).toBe(SESSION_LIMIT_S - 5);
  });

  it('shows warning status at warning threshold', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(SESSION_WARNING_S * 1000);
    });

    expect(result.current.status).toBe('warning');
  });

  it('expires at session limit', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(SESSION_LIMIT_S * 1000);
    });

    expect(result.current.status).toBe('expired');
    expect(result.current.remaining).toBe(0);
  });

  it('extends session by EXTENSION_S seconds', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(SESSION_WARNING_S * 1000);
    });

    expect(result.current.status).toBe('warning');

    act(() => {
      result.current.extend();
    });

    expect(result.current.hasExtended).toBe(true);
    // After extension, the total limit is SESSION_LIMIT_S + SESSION_EXTENSION_S
    expect(result.current.remaining).toBe(
      SESSION_LIMIT_S + SESSION_EXTENSION_S - SESSION_WARNING_S,
    );
    // With more time, should not yet be expired
    expect(result.current.status).toBe('running');
  });

  it('does not allow double extension', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.extend();
    });

    expect(result.current.hasExtended).toBe(true);

    // Try extending again - should not change anything
    act(() => {
      result.current.extend();
    });

    expect(result.current.hasExtended).toBe(true);
  });

  it('resets on stop', () => {
    const { result } = renderHook(() => useBabySessionTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.elapsed).toBe(0);
    expect(result.current.hasExtended).toBe(false);
  });
});
