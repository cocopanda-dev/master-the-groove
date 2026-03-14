// src/operations/polyrhythm/tap-tempo.ts

const MIN_BPM = 20;
const MAX_BPM = 240;
const BUFFER_SIZE = 4;
const RESET_THRESHOLD_MS = 2000;

type TapTempo = {
  tap: () => number | null;
  reset: () => void;
};

export const createTapTempo = (): TapTempo => {
  const timestamps: number[] = [];

  const reset = (): void => {
    timestamps.length = 0;
  };

  const tap = (): number | null => {
    const now = Date.now();

    // Reset if gap exceeds threshold
    const lastTimestamp = timestamps[timestamps.length - 1];
    if (lastTimestamp !== undefined && now - lastTimestamp > RESET_THRESHOLD_MS) {
      reset();
    }

    timestamps.push(now);

    // Keep only last BUFFER_SIZE timestamps
    if (timestamps.length > BUFFER_SIZE) {
      timestamps.splice(0, timestamps.length - BUFFER_SIZE);
    }

    // Need at least 2 timestamps to compute interval
    if (timestamps.length < 2) {
      return null;
    }

    // Compute average interval
    let totalInterval = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalInterval += (timestamps[i] ?? 0) - (timestamps[i - 1] ?? 0);
    }
    const avgInterval = totalInterval / (timestamps.length - 1);

    // Convert to BPM and clamp
    const bpm = Math.round(60000 / avgInterval);
    return Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
  };

  return { tap, reset };
};
