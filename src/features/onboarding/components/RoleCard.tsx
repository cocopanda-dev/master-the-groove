// src/features/onboarding/components/RoleCard.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';
import type { RoleOption, UserRole } from '../types';

interface RoleCardProps {
  readonly option: RoleOption;
  readonly selected: boolean;
  readonly onSelect: (role: UserRole) => void;
}

export const RoleCard = ({ option, selected, onSelect }: RoleCardProps) => (
  <Pressable
    onPress={() => onSelect(option.role)}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`${option.title} - ${option.description}`}
    style={[styles.card, selected && styles.selected]}
    testID={`role-card-${option.role}`}
  >
    <Text variant="h3" color={colors.textPrimary}>
      {option.title}
    </Text>
    <Text variant="body" color={colors.textSecondary}>
      {option.description}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    gap: 8,
    minHeight: 90,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
});
