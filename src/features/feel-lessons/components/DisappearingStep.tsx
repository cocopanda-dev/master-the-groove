// src/features/feel-lessons/components/DisappearingStep.tsx
// TODO: Replace with DisappearingBeatInline component from @features/disappearing-beat
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';
import type { LessonStep } from '@types';

interface DisappearingStepProps {
  readonly step: LessonStep;
  readonly onComplete?: () => void;
  readonly isCompleted: boolean;
}

/**
 * Stub placeholder for the Disappearing Beat step.
 * The full implementation is being built by another agent
 * in the @features/disappearing-beat module.
 */
export const DisappearingStep = ({ step, onComplete, isCompleted }: DisappearingStepProps) => (
  <View style={styles.container} testID="disappearing-step">
    <Text variant="h3" color={colors.textPrimary} align="center">
      Disappearing Beat Challenge
    </Text>

    <Text variant="body" color={colors.textPrimary} align="center">
      {step.instruction}
    </Text>

    {step.secondaryText ? (
      <Text variant="bodySmall" color={colors.textSecondary} align="center">
        {step.secondaryText}
      </Text>
    ) : null}

    <View style={styles.placeholderBox}>
      <Text variant="body" color={colors.textMuted} align="center">
        Full disappearing beat experience coming soon.
      </Text>
    </View>

    {!isCompleted ? (
      <Button
        accessibilityLabel="Mark as done"
        onPress={() => onComplete?.()}
        variant="secondary"
        size="lg"
      >
        Mark as Done
      </Button>
    ) : (
      <Text variant="body" color={colors.success} align="center">
        Step completed!
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    width: '100%',
    alignItems: 'center',
  },
});
