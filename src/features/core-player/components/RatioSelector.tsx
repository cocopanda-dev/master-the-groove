// src/features/core-player/components/RatioSelector.tsx
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import { fontSize } from '@design-system/tokens/typography';
import { MVP_RATIOS, ACTIVE_RATIO_IDS } from '../constants';
import type { PolyrhythmRatio } from '@types';

type RatioSelectorProps = {
  selectedRatioId: string;
  onSelect: (ratio: PolyrhythmRatio) => void;
};

export const RatioSelector = ({ selectedRatioId, onSelect }: RatioSelectorProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
    accessibilityLabel="Polyrhythm ratio selector"
  >
    {MVP_RATIOS.map((ratio) => {
      const isActive = ACTIVE_RATIO_IDS.has(ratio.id);
      const isSelected = ratio.id === selectedRatioId;

      return (
        <Pressable
          key={ratio.id}
          onPress={() => isActive && onSelect(ratio)}
          disabled={!isActive}
          accessibilityLabel={
            isActive
              ? `Select ${ratio.name} ratio`
              : `${ratio.name} ratio, coming soon`
          }
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled: !isActive }}
          testID={`ratio-pill-${ratio.id}`}
          style={[
            styles.pill,
            isSelected && styles.pillSelected,
            !isActive && styles.pillDisabled,
          ]}
        >
          <Text
            style={[
              styles.pillText,
              isSelected && styles.pillTextSelected,
              !isActive && styles.pillTextDisabled,
            ]}
          >
            {ratio.name}
          </Text>
          {!isActive && (
            <Text style={styles.comingSoonLabel}>Soon</Text>
          )}
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: colors.textPrimary,
  },
  pillTextDisabled: {
    color: colors.textMuted,
  },
  comingSoonLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
