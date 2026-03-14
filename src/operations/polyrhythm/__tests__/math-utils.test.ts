// src/operations/polyrhythm/__tests__/math-utils.test.ts
import { gcd, lcm } from '../math-utils';

describe('gcd', () => {
  it('computes gcd of 3 and 2', () => {
    expect(gcd(3, 2)).toBe(1);
  });

  it('computes gcd of 4 and 6', () => {
    expect(gcd(4, 6)).toBe(2);
  });

  it('computes gcd of 12 and 8', () => {
    expect(gcd(12, 8)).toBe(4);
  });

  it('handles equal values', () => {
    expect(gcd(5, 5)).toBe(5);
  });

  it('handles 1', () => {
    expect(gcd(1, 7)).toBe(1);
  });
});

describe('lcm', () => {
  it('computes lcm of 3 and 2', () => {
    expect(lcm(3, 2)).toBe(6);
  });

  it('computes lcm of 4 and 3', () => {
    expect(lcm(4, 3)).toBe(12);
  });

  it('computes lcm of 2 and 3', () => {
    expect(lcm(2, 3)).toBe(6);
  });

  it('computes lcm of 5 and 4', () => {
    expect(lcm(5, 4)).toBe(20);
  });
});
