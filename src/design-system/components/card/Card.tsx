// src/design-system/components/card/Card.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { borderRadius } from '../../tokens/border-radius';
import { shadows } from '../../tokens/shadows';
import { spacing } from '../../tokens/spacing';
import type { CardProps } from './types';

const variantStyles = {
  default: {
    backgroundColor: colors.surface,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
} as const;

export const Card = ({ children, variant = 'default', style, testID }: CardProps) => (
  <View
    testID={testID}
    style={[styles.base, variantStyles[variant], style]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
});
