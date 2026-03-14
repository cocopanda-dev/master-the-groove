// src/operations/polyrhythm/__tests__/tap-tempo.test.ts
import { createTapTempo } from '../tap-tempo';

describe('createTapTempo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null on first tap (not enough data)', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(1000));
    expect(tapTempo.tap()).toBeNull();
  });

  it('computes BPM from 2 taps', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500)); // 500ms interval = 120 BPM
    expect(tapTempo.tap()).toBe(120);
  });

  it('averages intervals from 4 taps', () => {
    const tapTempo = createTapTempo();
    // 4 taps at 600ms intervals = 100 BPM
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(600));
    tapTempo.tap();
    jest.setSystemTime(new Date(1200));
    tapTempo.tap();
    jest.setSystemTime(new Date(1800));
    expect(tapTempo.tap()).toBe(100);
  });

  it('keeps only last 4 timestamps (circular buffer)', () => {
    const tapTempo = createTapTempo();
    // 5 taps, should use last 4
    [0, 500, 1000, 1500, 2000].forEach((t) => {
      jest.setSystemTime(new Date(t));
      tapTempo.tap();
    });
    // Last 4 intervals: 500, 500, 500 -> avg 500ms = 120 BPM
    expect(tapTempo.tap()).not.toBeNull();
  });

  it('resets buffer after 2 second gap', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500));
    tapTempo.tap();
    // 2+ second gap
    jest.setSystemTime(new Date(3000));
    expect(tapTempo.tap()).toBeNull(); // buffer reset, first tap
  });

  it('clamps BPM to 20-240 range', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(100)); // 100ms = 600 BPM -> clamped to 240
    expect(tapTempo.tap()).toBe(240);
  });

  it('reset() clears the buffer', () => {
    const tapTempo = createTapTempo();
    jest.setSystemTime(new Date(0));
    tapTempo.tap();
    jest.setSystemTime(new Date(500));
    tapTempo.tap();
    tapTempo.reset();
    jest.setSystemTime(new Date(1000));
    expect(tapTempo.tap()).toBeNull();
  });
});
