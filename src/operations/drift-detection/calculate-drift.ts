// src/operations/drift-detection/calculate-drift.ts

/**
 * Represents a single drift measurement for one expected beat.
 */
export type DriftEntry = {
  /** The expected timestamp for beat 1 (ms) */
  expectedTimestamp: number;
  /** The actual tap timestamp (ms), or null if no tap was matched */
  tapTimestamp: number | null;
  /** Signed drift in ms (positive = late, negative = early), null if no tap */
  driftMs: number | null;
  /** Qualitative zone classification */
  zone: 'locked-in' | 'close' | 'drifting' | 'missed';
};

export type DriftResult = {
  /** Drift entries for every expected beat 1 in the stage */
  entries: DriftEntry[];
  /** Final drift (last cycle's drift), null if no taps at all */
  finalDriftMs: number | null;
  /** Final zone classification */
  finalZone: 'locked-in' | 'close' | 'drifting' | 'missed';
  /** Mean absolute drift across all matched taps */
  meanAbsDriftMs: number | null;
};

/** Drift zone thresholds in milliseconds */
const LOCKED_IN_THRESHOLD = 50;
const CLOSE_THRESHOLD = 120;

/**
 * Classify a drift value into a zone.
 */
export const classifyDriftZone = (
  driftMs: number | null,
): 'locked-in' | 'close' | 'drifting' | 'missed' => {
  if (driftMs === null) return 'missed';
  const abs = Math.abs(driftMs);
  if (abs <= LOCKED_IN_THRESHOLD) return 'locked-in';
  if (abs <= CLOSE_THRESHOLD) return 'close';
  return 'drifting';
};

/**
 * Pure function: given expected beat-1 timestamps and user tap timestamps,
 * calculate drift for each expected beat.
 *
 * For each expected beat, finds the nearest tap within +/- 50% of the beat interval.
 * Each tap can only be matched to one expected beat (greedy nearest-first).
 *
 * @param expectedTimestamps - Sorted array of expected beat-1 timestamps (ms)
 * @param tapTimestamps - Sorted array of user tap timestamps (ms)
 * @param beatIntervalMs - Duration of one cycle (ms), used to define the matching window
 */
export const calculateDrift = (
  expectedTimestamps: readonly number[],
  tapTimestamps: readonly number[],
  beatIntervalMs: number,
): DriftResult => {
  const maxWindow = beatIntervalMs * 0.5;
  const usedTaps = new Set<number>();

  const entries: DriftEntry[] = expectedTimestamps.map((expected) => {
    let bestTapIndex = -1;
    let bestAbsDrift = Infinity;

    for (let i = 0; i < tapTimestamps.length; i++) {
      if (usedTaps.has(i)) continue;
      const tap = tapTimestamps[i]!;
      const absDrift = Math.abs(tap - expected);
      if (absDrift <= maxWindow && absDrift < bestAbsDrift) {
        bestTapIndex = i;
        bestAbsDrift = absDrift;
      }
    }

    if (bestTapIndex >= 0) {
      usedTaps.add(bestTapIndex);
      const tap = tapTimestamps[bestTapIndex]!;
      const driftMs = tap - expected;
      return {
        expectedTimestamp: expected,
        tapTimestamp: tap,
        driftMs,
        zone: classifyDriftZone(driftMs),
      };
    }

    return {
      expectedTimestamp: expected,
      tapTimestamp: null,
      driftMs: null,
      zone: 'missed' as const,
    };
  });

  // Final drift = last cycle's drift
  const lastEntry = entries[entries.length - 1];
  const finalDriftMs = lastEntry?.driftMs ?? null;
  const finalZone = lastEntry?.zone ?? 'missed';

  // Mean absolute drift across matched taps
  const matchedDrifts = entries
    .map((e) => e.driftMs)
    .filter((d): d is number => d !== null);
  const meanAbsDriftMs =
    matchedDrifts.length > 0
      ? matchedDrifts.reduce((sum, d) => sum + Math.abs(d), 0) /
        matchedDrifts.length
      : null;

  return { entries, finalDriftMs, finalZone, meanAbsDriftMs };
};
