// src/design-system/components/badge/types.ts

export type BadgeVariant = 'executing' | 'hearing' | 'feeling' | 'neutral' | 'comingSoon';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  testID?: string;
};
