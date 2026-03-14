export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  tapMinimum: 44,
  tapMinimumBaby: 80,
} as const;

export type SpacingToken = keyof typeof spacing;
