// src/features/baby-mode/components/ActivityCard.tsx
import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';

interface BabyActivityCard {
  id: string;
  stageId: number;
  title: string;
  instruction: string;
  durationSeconds: number;
  icon?: string;
}

interface ActivityCardProps {
  readonly card: BabyActivityCard;
  readonly onPress?: () => void;
}

/**
 * A single activity card with warm styling, large text, and duration indicator.
 */
const ActivityCard = ({ card, onPress }: ActivityCardProps) => (
  <Pressable
    testID={`activity-card-${card.id}`}
    accessibilityLabel={`Activity: ${card.title}`}
    accessibilityHint={card.instruction}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.container,
      pressed && styles.pressed,
    ]}
  >
    {card.icon !== undefined && (
      <Text variant="h2" align="center">
        {card.icon}
      </Text>
    )}
    <Text variant="h4" color={colors.babyTextPrimary} align="center">
      {card.title}
    </Text>
    <Text
      variant="body"
      color={colors.babyTextSecondary}
      align="center"
    >
      {card.instruction}
    </Text>
    <Text variant="caption" color={colors.babyTextSecondary} align="center">
      ~{card.durationSeconds}s
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.babySurface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    width: 260,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});

export { ActivityCard };
export type { BabyActivityCard, ActivityCardProps };
