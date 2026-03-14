import { StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { borderRadius } from '../../tokens/border-radius';
import { fontSize, fontWeight } from '../../tokens/typography';
import type { ButtonVariant } from './types';

export const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 32 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56 },
});

export const variantBg: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  ghost: 'transparent',
};

export const variantText: Record<ButtonVariant, string> = {
  primary: colors.textPrimary,
  secondary: colors.textPrimary,
  ghost: colors.primaryLight,
};

export const baseStyles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  disabled: {
    opacity: 0.5,
  },
});
