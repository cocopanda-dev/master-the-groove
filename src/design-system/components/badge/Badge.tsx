// src/design-system/components/badge/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { borderRadius } from '../../tokens/border-radius';
import type { BadgeProps, BadgeVariant } from './types';

const variantConfig: Record<BadgeVariant, { bg: string; text: string }> = {
  executing: { bg: colors.secondary, text: colors.textPrimary },
  hearing: { bg: colors.primaryLight, text: colors.textPrimary },
  feeling: { bg: colors.success, text: colors.textPrimary },
  neutral: { bg: colors.surfaceLight, text: colors.textSecondary },
  comingSoon: { bg: colors.border, text: colors.textMuted },
};

export const Badge = ({ label, variant = 'neutral', testID }: BadgeProps) => {
  const config = variantConfig[variant];
  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: config.bg }]}
    >
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
