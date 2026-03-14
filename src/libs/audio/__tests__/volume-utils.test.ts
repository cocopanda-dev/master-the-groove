// src/libs/audio/__tests__/volume-utils.test.ts
import { computeFinalVolume, clampVolume } from '../volume-utils';

describe('computeFinalVolume', () => {
  it('multiplies layer volume by master volume', () => {
    expect(computeFinalVolume(0.8, 1.0)).toBeCloseTo(0.8);
    expect(computeFinalVolume(0.5, 0.5)).toBeCloseTo(0.25);
  });

  it('clamps to [0, 1]', () => {
    expect(computeFinalVolume(1.5, 1.0)).toBe(1.0);
    expect(computeFinalVolume(-0.5, 1.0)).toBe(0.0);
  });
});

describe('clampVolume', () => {
  it('clamps values to [0, 1]', () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(1.5)).toBe(1.0);
    expect(clampVolume(-0.2)).toBe(0.0);
  });
});
