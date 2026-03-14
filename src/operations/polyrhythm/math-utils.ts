// src/operations/polyrhythm/math-utils.ts

export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
};

export const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
