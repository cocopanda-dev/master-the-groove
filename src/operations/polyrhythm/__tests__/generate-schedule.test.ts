// src/operations/polyrhythm/__tests__/generate-schedule.test.ts
import { generatePolyrhythmSchedule } from '../generate-schedule';
import type { ScheduleEvent } from '../generate-schedule';

describe('generatePolyrhythmSchedule', () => {
  describe('3:2 at 120 BPM', () => {
    // LCM(3,2) = 6, cycleDuration = (6/120)*60000 = 3000ms
    const result = generatePolyrhythmSchedule(3, 2, 120);

    it('returns correct cycle duration', () => {
      expect(result.cycleDurationMs).toBe(3000);
    });

    it('returns correct LCM', () => {
      expect(result.lcm).toBe(6);
    });

    it('generates 5 events (3 A + 2 B)', () => {
      expect(result.events).toHaveLength(5);
    });

    it('has Layer A events at 0, 1000, 2000 ms', () => {
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => e.time)).toEqual([0, 1000, 2000]);
    });

    it('has Layer B events at 0, 1500 ms', () => {
      const layerB = result.events.filter((e) => e.layer === 'B');
      expect(layerB.map((e) => e.time)).toEqual([0, 1500]);
    });

    it('events are sorted by time', () => {
      const times = result.events.map((e) => e.time);
      const sorted = [...times].sort((a, b) => a - b);
      expect(times).toEqual(sorted);
    });

    it('coincident beats (beat 1) both appear at time 0', () => {
      const atZero = result.events.filter((e) => e.time === 0);
      expect(atZero).toHaveLength(2);
      expect(atZero.map((e) => e.layer).sort()).toEqual(['A', 'B']);
    });
  });

  describe('4:3 at 90 BPM', () => {
    // LCM(4,3) = 12, cycleDuration = (12/90)*60000 = 8000ms
    const result = generatePolyrhythmSchedule(4, 3, 90);

    it('returns correct cycle duration', () => {
      expect(result.cycleDurationMs).toBeCloseTo(8000, 1);
    });

    it('generates 7 events (4 A + 3 B)', () => {
      expect(result.events).toHaveLength(7);
    });

    it('has correct Layer A intervals (every 2000ms)', () => {
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => Math.round(e.time))).toEqual([0, 2000, 4000, 6000]);
    });

    it('has correct Layer B intervals (every 2666.67ms)', () => {
      const layerB = result.events.filter((e) => e.layer === 'B');
      expect(layerB[0]?.time).toBeCloseTo(0, 1);
      expect(layerB[1]?.time).toBeCloseTo(2666.67, 0);
      expect(layerB[2]?.time).toBeCloseTo(5333.33, 0);
    });
  });

  describe('2:3 (reverse) at 120 BPM', () => {
    // LCM(2,3) = 6, cycleDuration = (6/120)*60000 = 3000ms
    const result = generatePolyrhythmSchedule(2, 3, 120);

    it('Layer A has 2 hits, Layer B has 3 hits', () => {
      expect(result.events.filter((e) => e.layer === 'A')).toHaveLength(2);
      expect(result.events.filter((e) => e.layer === 'B')).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('validates BPM range (rejects < 20)', () => {
      expect(() => generatePolyrhythmSchedule(3, 2, 10)).toThrow();
    });

    it('validates BPM range (rejects > 240)', () => {
      expect(() => generatePolyrhythmSchedule(3, 2, 300)).toThrow();
    });

    it('validates ratio (rejects 0)', () => {
      expect(() => generatePolyrhythmSchedule(0, 2, 120)).toThrow();
    });

    it('beatIndex is 0-indexed within each layer', () => {
      const result = generatePolyrhythmSchedule(3, 2, 120);
      const layerA = result.events.filter((e) => e.layer === 'A');
      expect(layerA.map((e) => e.beatIndex)).toEqual([0, 1, 2]);
    });
  });
});

// Satisfy the unused import warning
const _unused: ScheduleEvent[] = [];
void _unused;
