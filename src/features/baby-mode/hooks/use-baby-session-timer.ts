// src/features/baby-mode/hooks/use-baby-session-timer.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { SESSION_LIMIT_S, SESSION_WARNING_S, SESSION_EXTENSION_S } from '../constants';

export type TimerStatus = 'idle' | 'running' | 'warning' | 'expired';

export interface UseBabySessionTimerResult {
  /** Elapsed time in seconds */
  readonly elapsed: number;

  /** Remaining time in seconds */
  readonly remaining: number;

  /** Current timer status */
  readonly status: TimerStatus;

  /** Whether the session has been extended */
  readonly hasExtended: boolean;

  /** Start the timer */
  readonly start: () => void;

  /** Stop/reset the timer */
  readonly stop: () => void;

  /** Extend the session by EXTENSION_S seconds (one-time only) */
  readonly extend: () => void;
}

export const useBabySessionTimer = (): UseBabySessionTimerResult => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExtended, setHasExtended] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const limit = hasExtended ? SESSION_LIMIT_S + SESSION_EXTENSION_S : SESSION_LIMIT_S;
  const warningThreshold = hasExtended ? SESSION_WARNING_S + SESSION_EXTENSION_S : SESSION_WARNING_S;

  const remaining = Math.max(0, limit - elapsed);

  const getStatus = useCallback((): TimerStatus => {
    if (!isRunning) return 'idle';
    if (elapsed >= limit) return 'expired';
    if (elapsed >= warningThreshold) return 'warning';
    return 'running';
  }, [isRunning, elapsed, limit, warningThreshold]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setHasExtended(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const extend = useCallback(() => {
    if (!hasExtended) {
      setHasExtended(true);
    }
  }, [hasExtended]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    elapsed,
    remaining,
    status: getStatus(),
    hasExtended,
    start,
    stop,
    extend,
  };
};
