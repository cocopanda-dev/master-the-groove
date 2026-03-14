// src/features/feel-lessons/components/LessonProgressBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@design-system';
import { colors, spacing, borderRadius } from '@design-system/tokens';

interface LessonProgressBarProps {
  readonly totalSteps: number;
  readonly currentStepIndex: number;
  readonly completedSteps: ReadonlySet<number>;
}

export const LessonProgressBar = ({
  totalSteps,
  currentStepIndex,
  completedSteps,
}: LessonProgressBarProps) => (
  <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const isCurrent = i === currentStepIndex;
      const isCompleted = completedSteps.has(i);

      return (
        <View
          key={i}
          style={[
            styles.dot,
            isCurrent && styles.dotCurrent,
            isCompleted && styles.dotCompleted,
          ]}
          testID={`progress-dot-${i}`}
        >
          {isCompleted ? (
            <Text variant="caption" color={colors.background}>
              {'\u2713'}
            </Text>
          ) : (
            <Text
              variant="caption"
              color={isCurrent ? colors.background : colors.textMuted}
            >
              {i + 1}
            </Text>
          )}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotCurrent: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  dotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
});
