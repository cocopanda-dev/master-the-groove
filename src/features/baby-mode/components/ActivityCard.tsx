// src/features/baby-mode/components/ActivityCard.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import type { BabyActivityCard } from '../types';

interface ActivityCardProps {
  readonly card: BabyActivityCard;
  readonly onPress: (card: BabyActivityCard) => void;
}

export const ActivityCard = ({ card, onPress }: ActivityCardProps) => {
  const durationLabel = card.durationSeconds >= 60
    ? `${Math.floor(card.durationSeconds / 60)} min`
    : `${card.durationSeconds}s`;

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(card)}
      testID={`activity-card-${card.id}`}
      accessibilityLabel={`${card.title} - ${durationLabel}`}
      accessibilityRole="button"
    >
      <Text variant="h4" color={colors.babyTextPrimary}>
        {card.title}
      </Text>
      <Text variant="bodySmall" color={colors.babyTextSecondary} numberOfLines={2}>
        {card.instruction}
      </Text>
      <Text variant="caption" color={colors.babyPrimary}>
        {durationLabel}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.babySurface,
    borderRadius: 12,
    padding: spacing.lg,
    width: 200,
    marginRight: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
