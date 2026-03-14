// src/operations/drift-detection/__tests__/calculate-drift.test.ts
import { calculateDrift, classifyDriftZone } from '../calculate-drift';

describe('classifyDriftZone', () => {
  it('returns "missed" for null', () => {
    expect(classifyDriftZone(null)).toBe('missed');
  });

  it('returns "locked-in" for |drift| <= 50ms', () => {
    expect(classifyDriftZone(0)).toBe('locked-in');
    expect(classifyDriftZone(50)).toBe('locked-in');
    expect(classifyDriftZone(-50)).toBe('locked-in');
    expect(classifyDriftZone(25)).toBe('locked-in');
  });

  it('returns "close" for 51-120ms', () => {
    expect(classifyDriftZone(51)).toBe('close');
    expect(classifyDriftZone(-51)).toBe('close');
    expect(classifyDriftZone(120)).toBe('close');
    expect(classifyDriftZone(-120)).toBe('close');
  });

  it('returns "drifting" for > 120ms', () => {
    expect(classifyDriftZone(121)).toBe('drifting');
    expect(classifyDriftZone(-121)).toBe('drifting');
    expect(classifyDriftZone(500)).toBe('drifting');
  });
});

describe('calculateDrift', () => {
  // 3:2 at 120 BPM => cycle = 3000ms
  const beatInterval = 3000;

  describe('perfect taps', () => {
    it('returns locked-in for all beats when taps are exact', () => {
      const expected = [0, 3000, 6000];
      const taps = [0, 3000, 6000];
      const result = calculateDrift(expected, taps, beatInterval);

      expect(result.entries).toHaveLength(3);
      result.entries.forEach((entry) => {
        expect(entry.driftMs).toBe(0);
        expect(entry.zone).toBe('locked-in');
      });
      expect(result.finalDriftMs).toBe(0);
      expect(result.finalZone).toBe('locked-in');
      expect(result.meanAbsDriftMs).toBe(0);
    });
  });

  describe('slightly early taps', () => {
    it('returns negative drift for early taps', () => {
      const expected = [0, 3000, 6000];
      const taps = [-30, 2970, 5960];
      const result = calculateDrift(expected, taps, beatInterval);

      expect(result.entries[0]!.driftMs).toBe(-30);
      expect(result.entries[0]!.zone).toBe('locked-in');
      expect(result.entries[1]!.driftMs).toBe(-30);
      expect(result.entries[2]!.driftMs).toBe(-40);
      expect(result.finalDriftMs).toBe(-40);
      expect(result.finalZone).toBe('locked-in');
    });
  });

  describe('late taps in "close" zone', () => {
    it('returns positive drift for late taps', () => {
      const expected = [0, 3000, 6000];
      const taps = [80, 3080, 6100];
      const result = calculateDrift(expected, taps, beatInterval);

      result.entries.forEach((entry) => {
        expect(entry.zone).toBe('close');
      });
      expect(result.finalDriftMs).toBe(100);
      expect(result.finalZone).toBe('close');
    });
  });

  describe('drifting taps', () => {
    it('classifies > 120ms as drifting', () => {
      const expected = [0, 3000];
      const taps = [200, 3200];
      const result = calculateDrift(expected, taps, beatInterval);

      result.entries.forEach((entry) => {
        expect(entry.zone).toBe('drifting');
      });
      expect(result.finalZone).toBe('drifting');
    });
  });

  describe('missed beats (no tap)', () => {
    it('marks entries as missed when no taps provided', () => {
      const expected = [0, 3000, 6000];
      const taps: number[] = [];
      const result = calculateDrift(expected, taps, beatInterval);

      result.entries.forEach((entry) => {
        expect(entry.tapTimestamp).toBeNull();
        expect(entry.driftMs).toBeNull();
        expect(entry.zone).toBe('missed');
      });
      expect(result.finalDriftMs).toBeNull();
      expect(result.finalZone).toBe('missed');
      expect(result.meanAbsDriftMs).toBeNull();
    });
  });

  describe('tap outside matching window', () => {
    it('does not match a tap beyond 50% of beat interval from any expected beat', () => {
      // With expected at [0, 6000] and interval 6000, window is 3000ms.
      // A tap at 3100 is |3100 - 0| = 3100 > 3000 AND |3100 - 6000| = 2900 < 3000
      // So use a single expected beat instead for cleaner test.
      const expected = [0];
      // 1600ms is beyond 1500ms window (50% of 3000)
      const taps = [1600];
      const result = calculateDrift(expected, taps, beatInterval);

      expect(result.entries[0]!.zone).toBe('missed');
    });
  });

  describe('tap within window boundary', () => {
    it('matches a tap exactly at the 50% window boundary', () => {
      const expected = [0, 3000];
      // 1500ms is exactly 50% of 3000ms
      const taps = [1500];
      const result = calculateDrift(expected, taps, beatInterval);

      // Should match to the nearest expected (0ms) since |1500 - 0| = 1500 = window
      expect(result.entries[0]!.tapTimestamp).toBe(1500);
      expect(result.entries[0]!.driftMs).toBe(1500);
      expect(result.entries[0]!.zone).toBe('drifting');
    });
  });

  describe('each tap used only once', () => {
    it('does not reuse a tap for multiple expected beats', () => {
      const expected = [0, 3000];
      // Only one tap, closer to first expected beat
      const taps = [100];
      const result = calculateDrift(expected, taps, beatInterval);

      expect(result.entries[0]!.tapTimestamp).toBe(100);
      expect(result.entries[1]!.tapTimestamp).toBeNull();
    });
  });

  describe('extra taps ignored', () => {
    it('ignores extra taps that do not match expected beats', () => {
      const expected = [0, 3000];
      const taps = [0, 500, 1000, 3000, 4000];
      const result = calculateDrift(expected, taps, beatInterval);

      expect(result.entries[0]!.driftMs).toBe(0);
      expect(result.entries[1]!.driftMs).toBe(0);
      expect(result.entries).toHaveLength(2);
    });
  });

  describe('mean absolute drift calculation', () => {
    it('correctly averages absolute drift values', () => {
      const expected = [0, 3000, 6000];
      const taps = [-20, 3040, 6060]; // drifts: -20, 40, 60
      const result = calculateDrift(expected, taps, beatInterval);

      // Mean abs: (20 + 40 + 60) / 3 = 40
      expect(result.meanAbsDriftMs).toBe(40);
    });

    it('excludes missed beats from mean calculation', () => {
      const expected = [0, 3000, 6000];
      const taps = [30]; // only first matched
      const result = calculateDrift(expected, taps, beatInterval);

      // Only one matched: abs(30) = 30
      expect(result.meanAbsDriftMs).toBe(30);
    });
  });

  describe('empty expected timestamps', () => {
    it('returns empty result for no expected beats', () => {
      const result = calculateDrift([], [100, 200], beatInterval);

      expect(result.entries).toHaveLength(0);
      expect(result.finalDriftMs).toBeNull();
      expect(result.finalZone).toBe('missed');
      expect(result.meanAbsDriftMs).toBeNull();
    });
  });
});
