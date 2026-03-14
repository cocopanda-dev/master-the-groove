// src/operations/baby/__tests__/calculate-stage.test.ts
import { calculateStageFromBirthDate } from '../calculate-stage';

describe('calculateStageFromBirthDate', () => {
  const now = new Date('2026-03-13');

  it('returns 0 for 0-3 months (passive listening)', () => {
    expect(calculateStageFromBirthDate('2026-01-01', now)).toBe(0);
  });

  it('returns 1 for 3-6 months (parent bounce)', () => {
    expect(calculateStageFromBirthDate('2025-10-01', now)).toBe(1);
  });

  it('returns 2 for 6-12 months (pat-a-cake)', () => {
    expect(calculateStageFromBirthDate('2025-06-01', now)).toBe(2);
  });

  it('returns 3 for 12-18 months (tap mode)', () => {
    expect(calculateStageFromBirthDate('2025-01-01', now)).toBe(3);
  });

  it('returns 4 for 18-36 months (instrument mode)', () => {
    expect(calculateStageFromBirthDate('2024-06-01', now)).toBe(4);
  });

  it('returns 5 for 36-60 months (simple game mode)', () => {
    expect(calculateStageFromBirthDate('2023-01-01', now)).toBe(5);
  });

  it('returns 5 for children older than 60 months', () => {
    expect(calculateStageFromBirthDate('2020-01-01', now)).toBe(5);
  });
});
