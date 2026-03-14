// src/features/onboarding/components/ExperienceLevelCard.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens/colors';
import { borderRadius } from '@design-system/tokens/border-radius';
import type { ExperienceOption, RhythmLevel } from '../types';

interface ExperienceLevelCardProps {
  readonly option: ExperienceOption;
  readonly selected: boolean;
  readonly onSelect: (level: RhythmLevel) => void;
}

export const ExperienceLevelCard = ({
  option,
  selected,
  onSelect,
}: ExperienceLevelCardProps) => (
  <Pressable
    onPress={() => onSelect(option.level)}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`${option.title} - ${option.description}`}
    style={[styles.card, selected && styles.selected]}
    testID={`experience-card-${option.level}`}
  >
    <Text variant="h4" color={colors.textPrimary}>
      {option.title}
    </Text>
    <Text variant="bodySmall" color={colors.textSecondary}>
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
    padding: 20,
    gap: 8,
    minHeight: 80,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
});
