// src/features/baby-mode/hooks/use-baby-session-timer.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { SESSION_LIMIT_S, WARNING_S, EXTENSION_S } from '../constants';

interface UseBabySessionTimerOptions {
  /** Called when elapsed reaches WARNING_S (150s) */
  onWarning?: () => void;
  /** Called when elapsed reaches the time limit (180s, or 240s if extended) */
  onTimeLimit?: () => void;
}

interface UseBabySessionTimerResult {
  /** Elapsed time in seconds */
  elapsed: number;
  /** Whether the warning threshold has been reached */
  isWarning: boolean;
  /** Whether the time limit has been reached */
  isTimeLimitReached: boolean;
  /** Whether the session has already been extended */
  hasExtended: boolean;
  /** Extend the session by EXTENSION_S (60s). Can only be called once. */
  extend: () => void;
  /** Reset the timer to zero */
  reset: () => void;
}

/**
 * Session timer for baby mode activities.
 *
 * - Warns at 150s via onWarning callback
 * - Fires onTimeLimit at 180s (or 240s after one-time extension)
 * - Extension adds 60s and can only be used once per session
 */
const useBabySessionTimer = (
  options?: UseBabySessionTimerOptions,
): UseBabySessionTimerResult => {
  const [elapsed, setElapsed] = useState(0);
  const [hasExtended, setHasExtended] = useState(false);
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningFiredRef = useRef(false);
  const limitFiredRef = useRef(false);

  const currentLimit = hasExtended
    ? SESSION_LIMIT_S + EXTENSION_S
    : SESSION_LIMIT_S;

  const isWarning = elapsed >= WARNING_S && !isTimeLimitReached;

  // Start the interval on mount
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Fire callbacks on threshold crossings
  useEffect(() => {
    if (elapsed >= WARNING_S && !warningFiredRef.current) {
      warningFiredRef.current = true;
      options?.onWarning?.();
    }
  }, [elapsed, options]);

  useEffect(() => {
    if (elapsed >= currentLimit && !limitFiredRef.current) {
      limitFiredRef.current = true;
      setIsTimeLimitReached(true);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      options?.onTimeLimit?.();
    }
  }, [elapsed, currentLimit, options]);

  const extend = useCallback(() => {
    if (hasExtended) return;
    setHasExtended(true);
    setIsTimeLimitReached(false);
    limitFiredRef.current = false;

    // Restart interval if it was stopped
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
  }, [hasExtended]);

  const reset = useCallback(() => {
    setElapsed(0);
    setHasExtended(false);
    setIsTimeLimitReached(false);
    warningFiredRef.current = false;
    limitFiredRef.current = false;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  return {
    elapsed,
    isWarning,
    isTimeLimitReached,
    hasExtended,
    extend,
    reset,
  };
};

export { useBabySessionTimer };
export type { UseBabySessionTimerOptions, UseBabySessionTimerResult };
