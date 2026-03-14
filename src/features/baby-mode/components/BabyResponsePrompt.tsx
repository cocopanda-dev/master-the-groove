// src/features/baby-mode/components/BabyResponsePrompt.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing } from '@design-system/tokens';

type BabyResponse = 'calm' | 'excited' | 'disengaged' | null;

interface BabyResponsePromptProps {
  readonly babyName: string;
  readonly onResponse: (response: BabyResponse) => void;
}

const RESPONSE_OPTIONS: readonly { label: string; value: BabyResponse; emoji: string }[] = [
  { label: 'Calm', value: 'calm', emoji: '(calm)' },
  { label: 'Excited', value: 'excited', emoji: '(happy)' },
  { label: 'Disengaged', value: 'disengaged', emoji: '(sleepy)' },
];

export const BabyResponsePrompt = ({ babyName, onResponse }: BabyResponsePromptProps) => (
  <View style={styles.container} testID="baby-response-prompt">
    <View style={styles.content}>
      <Text variant="h3" color={colors.babyTextPrimary} align="center">
        How did {babyName} respond?
      </Text>
      <View style={styles.optionsRow}>
        {RESPONSE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onResponse(option.value)}
            style={styles.optionButton}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            testID={`response-${option.value}`}
          >
            <Text variant="body" color={colors.babyTextSecondary}>
              {option.emoji}
            </Text>
            <Text variant="bodySmall" color={colors.babyTextPrimary}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => onResponse(null)}
        style={styles.skipButton}
        accessibilityLabel="Skip"
        accessibilityRole="button"
        testID="response-skip"
      >
        <Text variant="bodySmall" color={colors.babyTextSecondary}>
          Skip
        </Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.babySurface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    width: '85%',
    maxWidth: 360,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: colors.babyBackground,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: spacing.tapMinimumBaby,
    minHeight: spacing.tapMinimumBaby,
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
