// src/features/baby-mode/components/ActivityCardCarousel.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';
import { ActivityCard } from './ActivityCard';
import type { BabyActivityCard } from '../types';

interface ActivityCardCarouselProps {
  readonly cards: readonly BabyActivityCard[];
  readonly title: string;
  readonly onCardPress: (card: BabyActivityCard) => void;
}

export const ActivityCardCarousel = ({ cards, title, onCardPress }: ActivityCardCarouselProps) => (
  <View style={styles.container} testID="activity-card-carousel">
    <Text variant="h4" color={colors.babyTextPrimary}>
      {title}
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      accessibilityRole="list"
      accessibilityLabel={`${title} activities`}
    >
      {cards.map((card) => (
        <ActivityCard key={card.id} card={card} onPress={onCardPress} />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
});
