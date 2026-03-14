// src/features/baby-mode/__tests__/constants.test.ts
import { capBabyVolume, BABY_MAX_VOLUME } from '../constants';

describe('capBabyVolume', () => {
  it('returns requested volume when below max', () => {
    expect(capBabyVolume(0.3)).toBe(0.3);
  });

  it('returns BABY_MAX_VOLUME when requested exceeds max', () => {
    expect(capBabyVolume(0.8)).toBe(BABY_MAX_VOLUME);
    expect(capBabyVolume(1.0)).toBe(BABY_MAX_VOLUME);
  });

  it('returns exactly BABY_MAX_VOLUME at boundary', () => {
    expect(capBabyVolume(BABY_MAX_VOLUME)).toBe(BABY_MAX_VOLUME);
  });

  it('clamps negative values to 0', () => {
    expect(capBabyVolume(-0.5)).toBe(0);
  });

  it('returns 0 for 0 input', () => {
    expect(capBabyVolume(0)).toBe(0);
  });

  it('handles very large values', () => {
    expect(capBabyVolume(100)).toBe(BABY_MAX_VOLUME);
  });
});
