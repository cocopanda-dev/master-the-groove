// src/features/disappearing-beat/hooks/use-drift-tracker.ts
import { useCallback, useRef } from 'react';
import { useAudioStore } from '@data-access/stores';
import { calculateDrift } from '@operations/drift-detection';
import type { DriftResult } from '@operations/drift-detection';
import type { DisappearingBeatStage, StageConfig } from '../types';

type UseDriftTrackerReturn = {
  /** Record a tap event. Call with highest-precision timestamp available. */
  recordTap: (timestamp?: number) => void;
  /** Compute drift from all recorded taps against expected beat 1 timestamps */
  computeDrift: () => DriftResult;
  /** Reset all recorded data */
  reset: () => void;
};

/**
 * Tracks user taps during Stage 3 and calculates drift
 * against expected beat-1 timestamps.
 */
export const useDriftTracker = (
  config: StageConfig,
  stage: DisappearingBeatStage,
): UseDriftTrackerReturn => {
  const tapTimestampsRef = useRef<number[]>([]);
  const expectedBeat1sRef = useRef<number[]>([]);
  const getCurrentBeat1Timestamp = useAudioStore((s) => s.getCurrentBeat1Timestamp);
  const onCycleComplete = useAudioStore((s) => s.onCycleComplete);

  // Track expected beat 1 timestamps during stage 3
  const stageRef = useRef(stage);
  stageRef.current = stage;

  // Subscribe to cycle completions to record expected beat 1 timestamps
  const subscribedRef = useRef(false);
  if (stage === 'stage3' && !subscribedRef.current) {
    subscribedRef.current = true;
    // Record the first expected beat 1 immediately when entering stage 3
    const ts = getCurrentBeat1Timestamp();
    if (ts > 0) {
      expectedBeat1sRef.current.push(ts);
    }
  }

  // Use onCycleComplete to collect beat 1 timestamps during stage 3
  const cycleListenerRef = useRef<(() => void) | null>(null);

  if (stage === 'stage3' && !cycleListenerRef.current) {
    cycleListenerRef.current = onCycleComplete(() => {
      if (stageRef.current === 'stage3') {
        const ts = getCurrentBeat1Timestamp();
        if (ts > 0) {
          expectedBeat1sRef.current.push(ts);
        }
      }
    });
  }

  if (stage !== 'stage3' && cycleListenerRef.current) {
    cycleListenerRef.current();
    cycleListenerRef.current = null;
    subscribedRef.current = false;
  }

  const recordTap = useCallback((timestamp?: number) => {
    if (stageRef.current !== 'stage3') return;

    // Use best available timestamp:
    // nativeEvent.timestamp > performance.now() > Date.now()
    const ts = timestamp ?? performance.now();
    tapTimestampsRef.current.push(ts);
  }, []);

  const computeDrift = useCallback((): DriftResult => {
    const { ratioA, ratioB, bpm } = config;
    // Calculate cycle duration: LCM(ratioA, ratioB) / bpm * 60000
    const gcd = (a: number, b: number): number => {
      let x = Math.abs(a);
      let y = Math.abs(b);
      while (y !== 0) {
        const temp = y;
        y = x % y;
        x = temp;
      }
      return x;
    };
    const lcmVal = (ratioA * ratioB) / gcd(ratioA, ratioB);
    const cycleDurationMs = (lcmVal / bpm) * 60000;

    return calculateDrift(
      expectedBeat1sRef.current,
      tapTimestampsRef.current,
      cycleDurationMs,
    );
  }, [config]);

  const reset = useCallback(() => {
    tapTimestampsRef.current = [];
    expectedBeat1sRef.current = [];
    subscribedRef.current = false;
    if (cycleListenerRef.current) {
      cycleListenerRef.current();
      cycleListenerRef.current = null;
    }
  }, []);

  return { recordTap, computeDrift, reset };
};
